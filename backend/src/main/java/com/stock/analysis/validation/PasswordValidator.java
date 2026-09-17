package com.stock.analysis.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Regex checks:
    // ^(?=.*[0-9])       - must contain a digit
    // (?=.*[a-z])        - must contain a lowercase char
    // (?=.*[A-Z])        - must contain an uppercase char
    // (?=.*[@#$%^&+=!_]) - must contain a special char
    // (?=\S+$)           - no whitespace allowed
    // .{8,}$             - minimum length of 8
    private static final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!_])(?=\\S+$).{8,}$";
    private static final Pattern PATTERN = Pattern.compile(PASSWORD_PATTERN);

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
        // Initialization code if needed
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return false;
        }
        return PATTERN.matcher(password).matches();
    }
}
