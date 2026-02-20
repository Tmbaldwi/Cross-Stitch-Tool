import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

export function allowedFileTypes(allowedTypes: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;

    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();

      if (!allowedTypes.includes(extension)) {
        return { invalidFileType: true };
      }
    }

    return null;
  };
}
