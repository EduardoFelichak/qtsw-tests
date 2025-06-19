Feature: Exclusão de Tarefas

  Scenario: Usuário exclui uma tarefa com sucesso
    Given que o usuário "Deletador" está cadastrado com o e-mail "deletador@teste.com" e a senha "senha123"
    And está autenticado com o e-mail "deletador@teste.com" e a senha "senha123"
    And criou uma tarefa com o título "Tarefa a ser Excluída"
    When vai para a lista de tarefas
    And clica na tarefa "Tarefa a ser Excluída" para ver os detalhes
    And clica no botão de excluir
    Then a tarefa "Tarefa a ser Excluída" não deve mais ser exibida na lista