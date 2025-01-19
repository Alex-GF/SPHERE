import { RegisterFormProps } from "../../components/register-form"; 

export function validateRegister(formData: RegisterFormProps): string[] {
    const errors: string[] = [];

    _validateFirstName(formData.firstName, errors);
    _validateLastName(formData.lastName, errors);
    _validateEmail(formData.email, errors);
    _validatePassword(formData.password, formData.confirmPassword!, errors);
    _validatePhone(formData.phone, errors);
    _validateAddress(formData.address, errors);

    delete formData.confirmPassword;

    return errors;
}

function _validateFirstName(firstName: string, errors: string[]){
    if (firstName === undefined || firstName.trim() === "") {
        errors.push("First name is required");
        return;
    }

    if (firstName.length < 3 || firstName.length > 255) {
        errors.push("The first name must have between 3 and 255 characters long");
        return;
    }

    return true;
}

function _validateLastName(lastName: string, errors: string[]){
    if (lastName === undefined || lastName.trim() === "") {
        errors.push("Last name is required");
        return;
    }

    if (lastName.length < 1 || lastName.length > 255) {
        errors.push("The last name must have between 3 and 255 characters long");
        return;
    }
}

function _validateEmail(email: string, errors: string[]){
    const re = /^\S+@\S+\.\S{2,3}$/;

    if (email === undefined || email === "") {
        errors.push("Email is required");
        return;
    }else if (!re.test(email)) {
        errors.push("Invalid email address");
        return;
    }
}

function _validatePassword(password: string, confirmPassword: string, errors: string[]){
    if (password === undefined || password === "") {
        errors.push("Password is required");
        return;
    }
    
    if (password.length < 5) {
        errors.push("Password must be at least 6 characters");
        return;
    }

    if (password !== confirmPassword) {
        errors.push("Passwords do not match");
        return;
    }

}

function _validatePhone(phone: string | undefined, errors: string[]){
    if (phone === undefined || phone.trim() === "") {
        return;
    }

    if (phone.length < 1 || phone.length > 255) {
        errors.push("The phone must have between 1 and 255 characters long");
        return;
    }

    const phoneRegex = /^\+\d{1,3}\s?\d{1,14}$/;

    if (!phoneRegex.test(phone)) {
        errors.push("Invalid phone number format. It should start with a country code. E.g: +1 555 555 5555");
        return;
    }

}

function _validateAddress(address: string | undefined, errors: string[]){
    if (address === undefined || address.trim() === "") {
        return;
    }

    if (address.length < 1 || address.length > 255) {
        errors.push("The address must have between 1 and 255 characters long");
        return;
    }
}