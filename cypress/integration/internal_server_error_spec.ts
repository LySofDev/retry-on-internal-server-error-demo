describe('when attempting to login', () => {
  const emailField = () => cy.get('[name="email"]');
  const passwordField = () => cy.get('[name="password"]');
  const loginButton = () => cy.contains('Login');

  for (let i = 0; i < 10; i++) {
    it(i + ' - retries on random internal server errors', () => {
      cy.visit('http://localhost:4200');
      emailField().type('mac.hdz@gmail.com');
      passwordField().type('password');
      loginButton().click();
      cy.contains('You are logged in');
    });
  }
});
