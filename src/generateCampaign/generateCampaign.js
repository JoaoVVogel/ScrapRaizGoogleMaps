import { formataNumero } from "./ValidateTelefone.mjs";

// let result = [
//     {
//       placeId: 'ChIJ0bE6zolP4ZQRDi4-re7MruY',
//       status: 'Aberto',
//       category: 'Fornecedor de sistema de segurança',
//       address: 'Coronel Alberto shimitt Edificio laura 10, sala o1',
//       storeName: 'AG MONITORAMENTO',
//       phone: '5511988749207',
//       bizWebsite: null,
//       ratingText: '4,0 estrelas 2 comentários',
//       stars: 4,
//       numberOfReviews: 2,
//       googleUrl: 'https://www.google.com/maps/place/AG+Monitoramento/data=!4m7!3m6!1s0x94e14f89ce3ab1d1:0xe6aecceead3e2e0e!8m2!3d-27.0048589!4d-51.153262!16s%2Fg%2F11gzn52hvy!19sChIJ0bE6zolP4ZQRDi4-re7MruY?authuser=0&hl=pt-BR&rclk=1'
//     },
//     {
//       placeId: 'ChIJ0bE6zolP4ZQRDi4-re7MruY',
//       status: 'Aberto',
//       category: 'Fornecedor de sistema de segurança',
//       address: 'Coronel Alberto shimitt Edificio laura 10, sala o1',
//       storeName: 'AG MONITORAMENTO',
//       phone: '5511988749207',
//       bizWebsite: null,
//       ratingText: '4,0 estrelas 2 comentários',
//       stars: 4,
//       numberOfReviews: 2,
//       googleUrl: 'https://www.google.com/maps/place/AG+Monitoramento/data=!4m7!3m6!1s0x94e14f89ce3ab1d1:0xe6aecceead3e2e0e!8m2!3d-27.0048589!4d-51.153262!16s%2Fg%2F11gzn52hvy!19sChIJ0bE6zolP4ZQRDi4-re7MruY?authuser=0&hl=pt-BR&rclk=1'
//     },
//     {
//       placeId: 'ChIJ0bE6zolP4ZQRDi4-re7MruY',
//       status: 'Aberto',
//       category: 'Fornecedor de sistema de segurança',
//       address: 'Coronel Alberto shimitt Edificio laura 10, sala o1',
//       storeName: 'AG MONITORAMENTO',
//       phone: '5511988749207',
//       bizWebsite: "https://www.camarapinheiropreto.com",
//       ratingText: '4,0 estrelas 2 comentários',
//       stars: 4,
//       numberOfReviews: 2,
//       googleUrl: 'https://www.google.com/maps/place/AG+Monitoramento/data=!4m7!3m6!1s0x94e14f89ce3ab1d1:0xe6aecceead3e2e0e!8m2!3d-27.0048589!4d-51.153262!16s%2Fg%2F11gzn52hvy!19sChIJ0bE6zolP4ZQRDi4-re7MruY?authuser=0&hl=pt-BR&rclk=1'
//     },
//     {
//       placeId: 'ChIJAUQyF_1Q4ZQR3AG5TbkjRbM',
//       status: 'Aberto',
//       category: 'Assembléia',
//       address: 'Av. Mal. Costa e Silva, 111',
//       storeName: 'CÂMARA DE VEREADORES DE PINHEIRO PRETO',
//       phone: null,
//       bizWebsite: 'https://www.camarapinheiropreto.com',
//       ratingText: null,
//       stars: null,
//       numberOfReviews: null,
//       googleUrl: 'https://www.google.com/maps/place/C%C3%A2mara+de+Vereadores+de+Pinheiro+Preto/data=!4m7!3m6!1s0x94e150fd17324401:0xb34523b94db901dc!8m2!3d-27.0446726!4d-51.2301496!16s%2Fg%2F11h94p9y8m!19sChIJAUQyF_1Q4ZQR3AG5TbkjRbM?authuser=0&hl=pt-BR&rclk=1'
//     }
//   ]

//sendCampaignData(result, "'Monitoramento' São Domingos do Norte - ES")
 
export default async function sendCampaignData(result, query) {
    let nameCampaign = query.replace(/'/g, "");
    let whatsappId = "4ca207b4-3ad7-44ab-9d39-e5ef79713ffe";
    let queueId = "dc45f8f5-ef57-45ba-881e-0c14dffd72f8";
    let messages = [];

    for (let i = 0; i < result.length; i++) {
        if (!(result[i].bizWebsite)) {
            continue
        }
        if (result[i].bizWebsite.includes(".com")) { 
            if (result[i].bizWebsite.includes("instagram")){
                return;
            }
            if (result[i].bizWebsite.includes("rastreamento")){
                return;
            }
            if (!(result[i].phone)) {
                continue
            }
            
            let name = await treatName(result[i].storeName);
            let number = await formataNumero(result[i].phone);
            messages.push({
                "name": name,
                "number": number,
                "body": "Bom dia, tudo joia? Aqui é o Willian encontrei a {{contactName}} pelo google. Gostaria de saber se a empresa de vocês é de monitoramento ou comercializa sistemas de segurança" // mensagem que será enviada aos clientes
            });
        }
    }

    if(messages.length === 0){
        return;
    }
    // Estruturando objeto pra passar na API
    let campaignData = {
        "name": nameCampaign,
        "whatsappId": whatsappId,
        "queueId": queueId,
        "messages": messages
    }

    // Tornar name: em "name": e assim por diante
    let jsonString = JSON.stringify(campaignData).replace(/'/g, '"');
    generateCampaign(jsonString);
    messages = [];
}

// Tratativa para o nome que vem em maiúsculo
async function treatName(name) {
    return name.toLowerCase()
}


// Fazer o post para a APÌ contendo os dados
function generateCampaign(jsonString) {

    // console.log(jsonString)

    let authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJyZWFkOmNhbXBhaWducyIsIm1hbmFnZTpjYW1wYWlnbnMiLCJjcmVhdGU6bWVzc2FnZXMiLCJjcmVhdGU6bWVkaWFzIiwicmVhZDp3aGF0c2FwcHMiLCJ1cGRhdGU6d2hhdHNhcHBzIiwicmVhZDpxdWV1ZXMiLCJyZWFkOnVzZXJzIl0sImNvbXBhbnlJZCI6ImZmNDUzYmU5LTkyYzctNGVlZS1iNjE1LThmMTg5MDEzMTg0YSIsImlhdCI6MTcwNjE4MTM2Nn0.HrCeYP2zKSGMaePB2JX0va_ml1RjWIf-gKP6YU2I4M0" // Token do portal


    fetch("https://api.beta.naty.app/api/v2/campaigns", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken // Token do portal da Naty
        },
        body: jsonString
    })
        .then(response => {
            // console.log("response: " + JSON.stringify(response))
            if (!response.ok) {
                response.json().then(errorData => {
                    throw new Error("Erro ao enviar dados da campanha: " + JSON.stringify(errorData));
                });
            }
            return response.json();
        })
        .then(data => {
            let campaignId = data.data.campaignId;
            suspendCampaign(campaignId, authToken) // A campanha ja começa iniciada, aqui irá pausa-la
        })
        .catch(error => {
            console.error("Erro:", error);
        });
}


function suspendCampaign(campaignId, authToken) {
    fetch(`https://api.beta.naty.app/api/v2/campaigns/${campaignId}/suspend`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + authToken // Token do portal da Naty
        }
    })
        .then(response => {
            if (!response.ok) {
                response.json().then(errorData => {
                    throw new Error("Erro ao enviar dados da campanha: " + JSON.stringify(errorData));
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Campanha gerada e suspensa")
        })
        .catch(error => {
            console.error("Erro:", error);
        });
}