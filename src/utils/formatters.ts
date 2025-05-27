/**
 * Formata um número para exibição com máximo de 3 casas decimais
 * Remove zeros desnecessários no final
 */
export function formatScore(score: number): string {
  if (score === 0) return '0';
  
  // Arredonda para 3 casas decimais
  const rounded = Math.round(score * 1000) / 1000;
  
  // Converte para string e remove zeros desnecessários
  return rounded.toString();
}

/**
 * Formata um número para exibição com exatamente 3 casas decimais
 */
export function formatScoreFixed(score: number): string {
  const rounded = Math.round(score * 1000) / 1000;
  return rounded.toFixed(3);
}

/**
 * Arredonda um número para 3 casas decimais
 */
export function roundScore(score: number): number {
  return Math.round(score * 1000) / 1000;
} 