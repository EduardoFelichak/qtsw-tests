import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('que estou na página de registro', () => {
    cy.visit('/register');
    cy.url().should('include', '/register');
});

When('eu preencho o nome {string}, o e-mail {string} e a senha {string}', (name: string, email: string, password: string) => {
    cy.get('input[placeholder="Digite o nome"]').clear().type(name);
    cy.get('input[placeholder="Digite o e-mail"]').clear().type(email);
    cy.get('input[placeholder="Digite a senha"]').clear().type(password);
});

When('envio o formulário de registro', () => {
    cy.get('form').submit();
});

Then('devo ver a mensagem {string}', (message: string) => {
    cy.contains(message).should('be.visible');
});

Then('devo ser redirecionado para a página de login em alguns segundos', () => {
    cy.url({ timeout: 3000 }).should('include', '/login');
});
