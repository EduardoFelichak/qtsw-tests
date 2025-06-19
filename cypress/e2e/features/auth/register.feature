Feature: Registro de Usuário

  Scenario: Registro de um novo usuário com sucesso
    Given que estou na página de registro
    When eu preencho o nome "Novo Usuário", o e-mail "novo@teste.com" e a senha "senha123"
    And envio o formulário de registro
    Then devo ver a mensagem "Cadastro realizado com sucesso! Redirecionando para login..."
    And devo ser redirecionado para a página de login em alguns segundos