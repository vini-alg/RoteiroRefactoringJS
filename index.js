const { readFileSync } = require('fs');

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function calcularTotalApresentacao(apre, peca) {
  let total = 0;

  switch (peca.tipo) {
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
      throw new Error(`Peça desconhecia: ${peca.tipo}`);
  }
  return total;
}

function getPeca(apresentacao) {
  return pecas[apresentacao.id];
}

function calcularCredito(apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(apre).tipo === "comedia") 
     creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function calcularTotalFatura(apresentacoes) {
  let totalFatura = 0;
  for (let apre of apresentacoes) {
    totalFatura += calcularTotalApresentacao(apre, getPeca(apre));
  }
  return totalFatura;
}

function calcularTotalCreditos(apresentacoes) {
  let totalCreditos = 0;
  for (let apre of apresentacoes) {    
    totalCreditos += calcularCredito(apre);
  }
  return totalCreditos;
}

function gerarFaturaStr (fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre, getPeca(apre)))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(fatura.apresentacoes)} \n`;
  return faturaStr;
}

function gerarFaturaHtml (fatura, pecas) {
  let faturaHtml = `
  <html>
  <p>Fatura ${fatura.cliente} <p>
  <ul>`;
  for (let apre of fatura.apresentacoes) {
    faturaHtml += `
    <li>${getPeca(apre).nome}: ${formatarMoeda(calcularTotalApresentacao(apre, getPeca(apre)))} (${apre.audiencia} assentos)</li>`;
  }
  faturaHtml += `
  </ul>
  <p>Valor total: ${formatarMoeda(calcularTotalFatura(fatura.apresentacoes))}</p>
  <p>Créditos acumulados: ${calcularTotalCreditos(fatura.apresentacoes)}</p>
  </html>`;
  return faturaHtml;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaHtml = gerarFaturaHtml(faturas, pecas);
console.log(faturaHtml);