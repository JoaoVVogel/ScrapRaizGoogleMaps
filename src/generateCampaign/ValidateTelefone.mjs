  export async function formataNumero(dado) {
    let numero = dado.toString();

    numero = numero.replace(/\D/g, "");

    const fixos = ["1", "2", "3", "4", "5"];
    const estadosComNove = ["1", "2", "3"];

    if (numero.length == 10) {
      if (fixos.includes(numero[2])) {
        return
      }
      if (estadosComNove.includes(numero[0])) {
        // console.log("nove adicionado ao " + numero);
        numero =
          numero.substring(0, 2) + "9" + numero.substring(2, numero.length);
      }
    }

    if (numero.length == 11) {
      if (!estadosComNove.includes(numero[0])) {
        // console.log("nove removido do " + numero);
        numero = numero.substring(0, 2) + numero.substring(3, numero.length);
      }
    }

    if (numero.length > 11 || numero.length < 10) {
      if (numero.substring(0, 3) == "0800") {
        // console.log("é 0800");
      } else {
        // console.log("Número inválido!");
      }
    }

    numero = "55" + numero;
    return numero;
  }