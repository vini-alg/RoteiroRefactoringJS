const { readFileSync } = require('fs');

class ServicoCalculoFatura {

  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(apre).tipo === "comedia") 
       creditos += Math.floor(apre.audiencia / 5);
    return creditos;   
  }
  
  calcularTotalCreditos(apresentacoes) {
    let totalCreditos = 0;
    for (let apre of apresentacoes) {    
      totalCreditos += this.calcularCredito(apre);
    }
    return totalCreditos;
  }
  
  calcularTotalApresentacao(apre, peca) {
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
  
  calcularTotalFatura(apresentacoes) {
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apre, getPeca(apre));
    }
    return totalFatura;
  }
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(apresentacao) {
  return pecas[apresentacao.id];
}

function gerarFaturaStr (fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre, getPeca(apre)))} (${apre.audiencia} assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
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

const calc = new ServicoCalculoFatura();
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);