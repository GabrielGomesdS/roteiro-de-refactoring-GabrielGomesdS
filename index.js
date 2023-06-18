const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor / 100);
}

function getPeca(pecas, apre) {
  return pecas[apre.id];
}

function calcularCredito(pecas, apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas, apre).tipo === "comedia") {
    creditos += Math.floor(apre.audiencia / 5);
  }
  return creditos;
}

function calcularTotalCreditos(pecas, apresentacoes) {
  let totalCreditos = 0;

  for (let apre of apresentacoes) {
    let creditos = calcularCredito(pecas, apre);
    totalCreditos += creditos;
  }

  return totalCreditos;
}

function calcularTotalApresentacao(pecas, apre) {
  let total = 0;

  switch (getPeca(pecas, apre).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
      throw new Error(`Peça desconhecida: ${getPeca(pecas, apre).tipo}`);
  }

  return total;
}

function calcularTotalFatura(pecas, apresentacoes) {
  let totalFatura = 0;

  for (let apre of apresentacoes) {
    let total = calcularTotalApresentacao(pecas, apre);
    totalFatura += total;
  }

  return totalFatura;
}

function gerarFaturaStr(fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    // mais uma linha da fatura
    faturaStr += `  ${getPeca(pecas, apre).tipo}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }

  const totalFatura = calcularTotalFatura(pecas, fatura.apresentacoes);
  const totalCreditos = calcularTotalCreditos(pecas, fatura.apresentacoes);

  faturaStr += `Valor total: ${formatarMoeda(totalFatura)}\n`;
  faturaStr += `Créditos acumulados: ${totalCreditos} \n`;

  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
