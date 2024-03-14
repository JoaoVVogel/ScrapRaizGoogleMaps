import fs from 'fs';
import { exec } from 'child_process';
import { runSearch } from './src/scrap/searchGoogleMapsLink.mjs';


const rawdata = fs.readFileSync('/Users/joaovitorvogelvieira/Documents/GitHub/scrapNaty/GerarScrapECampanha/ScrapRaizGoogleMaps/src/populacao/populacao_2020.json');
const cidade = JSON.parse(rawdata);

let cidadesEmbaralhadas;
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sortearCidadesPorEstado(estadoDesejado, populacaoDesejada) {
  if (!cidadesEmbaralhadas || estadoDesejado !== estadoDesejado) {
      const cidadesPorEstado = cidade.reduce((accumulator, item) => {

        const { cidade, uf } = item;
        const estado = uf || item.estado;

        if (!accumulator[estado]) {
          accumulator[estado] = [];
        }
        if(item.total >= parseInt(populacaoDesejada)){
          accumulator[estado].push(cidade);
        }

      return accumulator;
    }, {});
    const estadoUpperCase = estadoDesejado.toUpperCase();
    const cidadesDoEstado = cidadesPorEstado[estadoUpperCase] || [];
    cidadesEmbaralhadas = shuffleArray(cidadesDoEstado.slice());
  }

  return () => {
    // Retorna uma cidade por chamada
    if (cidadesEmbaralhadas.length === 0) {
      // console.log('Todas as cidades foram sorteadas.');
      return null;
    }
    return cidadesEmbaralhadas.shift();
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function processQuery(query) {
  var cidade = query.split(" ").slice(1, -2).join(" ").toUpperCase();
  var estado = query.split(" ").slice(-1)[0].toUpperCase();
  var termo = query.split(" ").slice(0, 1).join(" ").toUpperCase();

  return { cidade, estado, termo };
}

async function index(termo, estado, populacaoDesejada) {
  const sorteioCidade = sortearCidadesPorEstado(estado, populacaoDesejada);
  let cidadeSorteada;

  while ((cidadeSorteada = sorteioCidade()) !== null) {
    const query = `'${termo}' ${cidadeSorteada} - ${estado}`;
    await executeSearchWithRandomDelay(query);
    await new Promise(resolve => setTimeout(resolve, 180 * 1000));
  }
}

async function executeSearchWithRandomDelay(query) {
  const maxTentativas = 3;
  let tentativas = 0;

  while (tentativas < maxTentativas) {
    try {
      const shouldWait = Math.random() < 0.5; // 50% de chance de esperar

      if (shouldWait) {
        const waitTime = getRandomInt(1, 5) * 60 * 1000; // Convertendo minutos para milissegundos
        // console.log(`Esperando por ${waitTime / 1000} segundos antes da próxima chamada.`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      limparCacheNpm();
      await runSearch(query);
      return;
    } catch (error) {
      // console.error(`Erro na tentativa ${tentativas + 1}: ${error.message}`);
      tentativas++;
    }
  }
  if (tentativas === maxTentativas) {
    // console.log(`Atingido o número máximo de tentativas para a cidade. Ignorando: ${query}`);
  }
}


function limparCacheNpm() {
  exec('npm cache verify', (error, stderr) => {
    if (error) {
      console.error(`Erro ao verificar o cache: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erro no comando: ${stderr}`);
      return;
    }

  });
}

index("Monitoramento", "SP", 100000);