import * as React from 'react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => (
  <select
    className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    {...props}
  >
    {children}
  </select>
)

export const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`border rounded-md px-3 py-2 text-sm bg-white ${className}`} {...props} />
)

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`mt-2 border rounded-md bg-white shadow ${className}`} {...props} />
)

export const SelectItem: React.FC<React.OptionHTMLAttributes<HTMLOptionElement>> = ({ children, ...props }) => (
  <option {...props}>{children}</option>
)

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span className="text-gray-500">{placeholder}</span>
)


