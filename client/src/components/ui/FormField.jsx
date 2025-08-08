import { Field } from 'formik';

export default function FormField({
  name,
  label,
  type = 'text',
  as,
  errors,
  touched,
  options,
  ...props
}) {
  const hasError = errors[name] && touched[name];

  const baseClasses = `mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
    hasError
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
  }`;

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {as === 'select' ? (
        <Field
          as="select"
          name={name}
          className={baseClasses}
          {...props}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field>
      ) : as === 'textarea' ? (
        <Field
          as="textarea"
          name={name}
          className={baseClasses}
          {...props}
        />
      ) : (
        <Field
          type={type}
          name={name}
          className={baseClasses}
          {...props}
        />
      )}
      {hasError && (
        <p className="mt-1 text-xs text-red-600">{errors[name]}</p>
      )}
    </div>
  );
}
