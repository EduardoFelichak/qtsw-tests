import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given(
  'que o usuário {string} está cadastrado com o e-mail {string} e a senha {string}',
  (name: string, email: string, password: string) => {
    cy.registerUser({ name, email, password }); 
  },
);

Given(
  'está autenticado com o e-mail {string} e a senha {string}',
  (email: string, password: string) => {
    cy.login(email, password);
  },
);

Given('criou uma tarefa com o título {string}', (title: string) => {
  cy.visit('/tasks/create');
  cy.get('input[name="title"]').clear().type(title);
  cy.get('form[data-testid="task-form"]').submit();
  cy.contains(title).should('be.visible');
});

When('vai para a lista de tarefas', () => {
  cy.visit('/tasks');
  cy.url().should('include', '/tasks');
});

When('clica na tarefa {string} para ver os detalhes', (title: string) => {
  cy.contains(title).click();
});

When('clica no botão de excluir', () => {
  cy.get('button').contains('Excluir').click();
});

Then(
  'a tarefa {string} não deve mais ser exibida na lista',
  (title: string) => {
    cy.url().should('include', '/tasks');
    cy.contains(title).should('not.exist');
  },
);