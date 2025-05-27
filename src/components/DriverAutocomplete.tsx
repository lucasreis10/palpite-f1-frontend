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

  const filteredDrivers =
    query === ''
      ? drivers
      : drivers.filter((driver) => {
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

  return (
    <div className="flex items-center gap-4">
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
        position <= 3 ? 'bg-green-100 text-green-800' : 
        position <= 6 ? 'bg-blue-100 text-blue-800' : 
        'bg-gray-100 text-gray-800'
      }`}>
        {position}
      </span>
      <Combobox value={selectedDriver} onChange={(driver: Driver | null) => handleSelect(driver)} disabled={disabled}>
        <div className="relative flex-1">
          <div className={`relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 text-left focus-within:border-f1-red focus-within:ring-1 focus-within:ring-f1-red ${
            disabled ? 'bg-gray-100' : 'bg-white'
          }`}>
            <Combobox.Input
              className={`w-full border-none py-2 pl-3 pr-16 text-sm leading-5 focus:ring-0 ${
                disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'
              }`}
              displayValue={(driver: Driver) => driver ? `${driver.name} - ${driver.team}` : ''}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={disabled ? "Prazo encerrado" : "Selecione um piloto"}
              disabled={disabled}
            />
            
            {/* Botão de limpar */}
            {selectedDriver && selectedDriver.name && !disabled && (
              <button
                type="button"
                className="absolute inset-y-0 right-8 flex items-center pr-1 hover:bg-gray-100 rounded"
                onClick={handleClear}
                title="Limpar seleção"
              >
                <XMarkIcon
                  className="h-4 w-4 text-gray-400 hover:text-gray-600"
                  aria-hidden="true"
                />
              </button>
            )}
            
            <Combobox.Button 
              className="absolute inset-y-0 right-0 flex items-center pr-2" 
              disabled={disabled}
              onClick={() => !disabled && setIsOpen(!isOpen)}
            >
              <ChevronUpDownIcon
                className={`h-5 w-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
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
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              static
            >
              {filteredDrivers.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Nenhum piloto encontrado.
                </div>
              ) : (
                filteredDrivers.map((driver) => (
                  <Combobox.Option
                    key={driver.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-f1-red text-black' : 'text-gray-900'
                      }`
                    }
                    value={driver}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className={`flex flex-col ${selected ? 'font-medium' : 'font-normal'}`}>
                          <span className="block truncate">
                            {driver.name}
                          </span>
                          <span className={`block truncate text-sm ${
                            active ? 'text-black/70' : 'text-gray-500'
                          }`}>
                            {driver.team}
                          </span>
                        </div>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-black' : 'text-f1-red'
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