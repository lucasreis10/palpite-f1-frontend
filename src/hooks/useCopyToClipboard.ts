import { useState } from 'react';

interface Driver {
  id: number;
  name: string;
  team: string;
}

interface NextGrandPrix {
  id: number;
  name: string;
  season: number;
  round: number;
  country: string;
  city: string;
  circuitName: string;
  raceDateTime: string;
  qualifyingDateTime?: string;
}

export const useCopyToClipboard = () => {
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const formatGuessToText = (
    qualifyingDrivers: (Driver | null)[],
    raceDrivers: (Driver | null)[],
    grandPrix?: NextGrandPrix | null
  ): string => {
    let text = '';

    // Cabeçalho com info do GP
    if (grandPrix) {
      text += `🏁 ${grandPrix.name} - ${grandPrix.season}\n`;
      text += `🏎️ ${grandPrix.circuitName}, ${grandPrix.city}\n\n`;
    }

    // Qualifying
    text += '🏎️ QUALIFYING:\n';
    const validQualifyingDrivers = qualifyingDrivers.filter(driver => driver !== null) as Driver[];
    
    if (validQualifyingDrivers.length > 0) {
      validQualifyingDrivers.forEach((driver, index) => {
        const position = index + 1;
        const emoji = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '  ';
        text += `${emoji} ${position}º - ${driver.name}\n`;
      });
    } else {
      text += '   Nenhum piloto selecionado\n';
    }

    text += '\n';

    // Race
    text += '🏁 RACE:\n';
    const validRaceDrivers = raceDrivers.filter(driver => driver !== null) as Driver[];
    
    if (validRaceDrivers.length > 0) {
      validRaceDrivers.forEach((driver, index) => {
        const position = index + 1;
        const emoji = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '  ';
        text += `${emoji} ${position}º - ${driver.name}\n`;
      });
    } else {
      text += '   Nenhum piloto selecionado\n';
    }

    text += '\n🎮 Feito com Palpite F1';

    return text;
  };

  const copyToClipboard = async (
    qualifyingDrivers: (Driver | null)[],
    raceDrivers: (Driver | null)[],
    grandPrix?: NextGrandPrix | null
  ): Promise<boolean> => {
    setIsCopying(true);
    setCopySuccess(false);

    try {
      const textToCopy = formatGuessToText(qualifyingDrivers, raceDrivers, grandPrix);
      
      if (navigator.clipboard && window.isSecureContext) {
        // Usar Clipboard API se disponível
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback para browsers mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopySuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);

      return true;
    } catch (error) {
      console.error('Erro ao copiar para clipboard:', error);
      return false;
    } finally {
      setIsCopying(false);
    }
  };

  return {
    copyToClipboard,
    isCopying,
    copySuccess,
    formatGuessToText
  };
}; 