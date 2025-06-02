import { Fragment, useState } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, XMarkIcon } from '@heroicons/react/20/solid'

interface Driver {
  id: number;
  name: string;
  team: string;
}

interface DriverAutocompleteProps {
  drivers: Driver[];
  selectedDriver: Driver | null;
  onSelect: (driver: Driver | null) => void;
  position: number;
  disabled?: boolean;
}

export function DriverAutocomplete({ drivers, selectedDriver, onSelect, position, disabled = false }: DriverAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  console.log(`DriverAutocomplete posição ${position}: recebeu ${drivers.length} drivers`);

  const filteredDrivers =
    query === ''
      ? drivers
      : drivers.filter((driver) => {
          // Verificação de segurança antes de filtrar
          if (!driver || !driver.name || !driver.team) return false;
          const searchStr = `${driver.name} ${driver.team}`.toLowerCase()
          return searchStr.includes(query.toLowerCase())
        })

  const handleFocus = () => {
    if (!disabled) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    // Pequeno delay para permitir clique nas opções
    setTimeout(() => setIsOpen(false), 150)
  }

  const handleSelect = (driver: Driver | null) => {
    onSelect(driver)
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = () => {
    if (!disabled && selectedDriver) {
      onSelect(null as any) // Limpar seleção passando null
      setQuery('')
      setIsOpen(false)
    }
  }

  // Definir cores da posição
  const getPositionStyle = (pos: number) => {
    if (pos === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500 shadow-lg'; // Ouro
    if (pos === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white border-gray-400 shadow-lg'; // Prata
    if (pos === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white border-amber-700 shadow-lg'; // Bronze
    if (pos <= 6) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Badge da posição - maior em mobile */}
      <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 rounded-full font-bold text-sm sm:text-xs border-2 flex-shrink-0 ${getPositionStyle(position)}`}>
        {position}
      </div>
      
      <Combobox value={selectedDriver} onChange={(driver: Driver | null) => handleSelect(driver)} disabled={disabled}>
        <div className="relative flex-1">
          <div className={`relative w-full cursor-default overflow-hidden rounded-lg border-2 text-left transition-all ${
            disabled 
              ? 'bg-gray-100 border-gray-200' 
              : isOpen
              ? 'border-f1-red ring-2 ring-f1-red/20'
              : 'border-gray-300 hover:border-gray-400 focus-within:border-f1-red focus-within:ring-2 focus-within:ring-f1-red/20'
          }`}>
            <Combobox.Input
              className={`w-full border-none py-3 sm:py-2 pl-4 sm:pl-3 pr-20 sm:pr-16 text-sm leading-5 focus:ring-0 ${
                disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
              }`}
              displayValue={(driver: Driver) => {
                if (!driver) return '';
                // Verificações de segurança para evitar erros
                if (!driver.name || !driver.team) return '';
                
                // Em mobile, mostrar apenas o sobrenome para economizar espaço
                const names = driver.name.split(' ');
                const lastName = names[names.length - 1];
                const teamShort = driver.team.substring(0, 15);
                return window.innerWidth < 640 ? `${lastName} - ${teamShort}` : `${driver.name} - ${driver.team}`;
              }}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={disabled ? "⏰ Prazo encerrado" : "🔍 Toque para selecionar piloto"}
              disabled={disabled}
            />
            
            {/* Botão de limpar - maior em mobile */}
            {selectedDriver && selectedDriver.name && selectedDriver.team && !disabled && (
              <button
                type="button"
                className="absolute inset-y-0 right-10 sm:right-8 flex items-center pr-1 hover:bg-gray-700 rounded p-1 transition-colors"
                onClick={handleClear}
                title="Limpar seleção"
              >
                <XMarkIcon
                  className="h-5 w-5 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-600"
                  aria-hidden="true"
                />
              </button>
            )}
            
            {/* Botão dropdown - maior em mobile */}
            <Combobox.Button 
              className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-2" 
              disabled={disabled}
              onClick={() => !disabled && setIsOpen(!isOpen)}
            >
              <ChevronUpDownIcon
                className={`h-6 w-6 sm:h-5 sm:w-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          
          <Transition
            as={Fragment}
            show={isOpen}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options 
              className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200"
              static
            >
              {filteredDrivers.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-4 px-4 text-gray-700 text-center">
                  <span className="block text-sm">🔍 Nenhum piloto encontrado.</span>
                  <span className="block text-xs text-gray-500 mt-1">Tente buscar por nome ou equipe</span>
                </div>
              ) : (
                filteredDrivers
                  .filter(driver => driver && driver.name && driver.team) // Filtrar drivers válidos
                  .map((driver) => (
                  <Combobox.Option
                    key={driver.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-3 sm:py-2 pl-12 sm:pl-10 pr-4 transition-colors ${
                        active ? 'bg-f1-red text-black' : 'text-gray-900 bg-gray hover:bg-black'
                      }`
                    }
                    value={driver}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className={`flex flex-col ${selected ? 'font-semibold' : 'font-normal'}`}>
                          <span className="block truncate text-sm sm:text-sm">
                            {driver.name}
                          </span>
                          <span className={`block truncate text-xs sm:text-sm mt-0.5 ${
                            active ? 'text-black' : 'text-gray-500'
                          }`}>
                            {driver.team}
                          </span>
                        </div>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-gray-900' : 'text-f1-red'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
} 