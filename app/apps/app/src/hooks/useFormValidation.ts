import { useState } from "react";
import useDeepEffect from "./useDeepEffect";

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

interface ValidationErrors {
  [key: string]: string | null;
}

/* 
  Custom React hook that handles form validation
  initialValues is an object with the initial values of the form fields
  validationRules is an object with the validation rules for each field, the key is the field name and the value is a function that returns an error message or null if the field is valid
  example of validationRules:
  {
    email: (value: string) => {
      if (!value) {
        return "Email is required";
      }
      if (!isEmail(value)) {
        return "Email is invalid";
      }
      return null;
    }
*/
export default function useFormValidation<T = any>(initialValues: T, validationRules: ValidationRules) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(true);

  useDeepEffect(() => {
    validateForm();
  }, [values]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const validateForm = (): void => {
    const newErrors: ValidationErrors = {};
    for (const fieldName in values) {
      if (validationRules[fieldName]) {
        const errorMessage = validationRules[fieldName](values[fieldName]);
        newErrors[fieldName] = errorMessage;
      }
    }
    setErrors(newErrors);
    const isFormValid = Object.values(newErrors).every(error => error === null);
    setIsFormValid(isFormValid);
  };

  const resetForm = (values?: T): void => {
    if (values) {
      setValues(values);
      return;
    }
    setValues(initialValues);
  };

  return {
    formValues: values,
    formErrors: errors,
    isFormValid,
    handleFormChange: handleChange,
    resetFormValues: resetForm,
  };
}
