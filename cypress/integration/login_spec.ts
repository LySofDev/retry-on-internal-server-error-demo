describe('The Login Screen', () => {
  const emailField = () => cy.get('[name="email"]');
  const passwordField = () => cy.get('[name="password"]');
  const loginButton = () => cy.contains('Login');

  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  it('shows the Demo branding', () => {
    cy.contains('Demo: Retry on Internal Server Error');
  });

  it('has an email field', () => {
    emailField();
  });

  it('has a password field', () => {
    passwordField();
  });

  describe('when filling in the email field', () => {
    describe('with an empty string', () => {
      beforeEach(() => {
        emailField().type(' ');
        passwordField().focus();
      });

      it('shows an error message', () => {
        cy.contains('Email is not valid');
      });
    });

    describe('with an invalid email', () => {
      beforeEach(() => {
        emailField().type('foo.bar.biz');
        passwordField().focus();
      });

      it('shows an error message', () => {
        cy.contains('Email is not valid');
      });
    });

    describe('with a valid email', () => {
      beforeEach(() => {
        emailField().type('mac.hdz@gmail.com');
        passwordField().focus();
      });

      it('doesnt show an error message', () => {
        cy.contains('Email is not valid').should('not.exist');
      });
    });
  });

  describe('when filling in the password field', () => {
    describe('with an empty string', () => {
      beforeEach(() => {
        passwordField().type(' ');
        emailField().focus();
      });

      it('shows an error message', () => {
        cy.contains('Password is not valid');
      });
    });

    describe('with a string thats less than 8 characters long', () => {
      beforeEach(() => {
        passwordField().type('123456');
        emailField().focus();
      });

      it('shows an error message', () => {
        cy.contains('Password is not valid');
      });
    });

    describe('with a string that is longer than 7 characters', () => {
      beforeEach(() => {
        passwordField().type('123456789');
        emailField().focus();
      });

      it('doesnt show an error message', () => {
        cy.contains('Password is not valid').should('not.exist');
      });
    });

    describe('when filling in the entire form', () => {
      describe('with valid credentials', () => {
        beforeEach(() => {
          emailField().type('mac.hdz@gmail.com');
          passwordField().type('password');
          loginButton().focus();
        });

        it('enables the Login button', () => {
          loginButton().should('not.be.disabled');
        });

        describe('and clicking the login button', () => {
          beforeEach(() => {
            loginButton().click();
          });

          it('shows a Logged in message', () => {
            cy.contains('You are logged in');
          });
        });
      });
    });

    describe('with invalid credentials', () => {
      beforeEach(() => {
        emailField().type('mac.hdz@gmail.com');
        passwordField().type('wrongpassword');
        loginButton().focus();
      });

      it('enables the Login button', () => {
        loginButton().should('not.be.disabled');
      });

      describe('and clicking the login button', () => {
        beforeEach(() => {
          loginButton().click();
        });

        it('shows a Logged in message', () => {
          cy.contains('Account was not found');
        });
      });
    });
  });
});
