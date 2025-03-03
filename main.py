import os
import re

# Define the token types
token_specifications = [
    ('NUMBER', r'\d+'),  # Integer numbers
    ('STRING', r"'[^']*'"),  # Strings enclosed in single quotes
    ('ID', r'[A-Za-z_][A-Za-z0-9_]*'),  # Identifiers (variables)
    ('ASSIGN', r'='),  # Assignment operator
    ('LPAREN', r'\('),  # Left parenthesis
    ('RPAREN', r'\)'),  # Right parenthesis
    ('COMMA', r','),  # Comma for list separation
    ('KEYWORD', r'(write|input|exit|variable)'),  # Keywords
    ('WHITESPACE', r'\s+'),  # Skip over spaces
    ('MISMATCH', r'.'),  # Any unmatched characters
]

# Combine the specifications into a single regular expression
master_pattern = '|'.join(f'(?P<{pair[0]}>{pair[1]})' for pair in token_specifications)

def lex(characters):
    line_num = 1
    line_start = 0
    for mo in re.finditer(master_pattern, characters):
        kind = mo.lastgroup
        value = mo.group()
        if kind == 'WHITESPACE':
            continue
        elif kind == 'MISMATCH':
            raise RuntimeError(f'Unexpected character {value!r}')
        yield kind, value


class Parser:
    def __init__(self, lexer):
        self.lexer = lexer
        self.tokens = list(lexer)
        self.pos = 0
        self.variables = {}  # To store variables

    def current_token(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def eat(self, token_type):
        if self.current_token() and self.current_token()[0] == token_type:
            self.pos += 1
        else:
            raise SyntaxError(f"Expected {token_type} but got {self.current_token()}")

    def parse_statement(self):
        token = self.current_token()
        if token and token[0] == 'KEYWORD':
            keyword = token[1]
            if keyword == 'write':
                self.eat('KEYWORD')
                self.eat('LPAREN')
                expr = self.parse_expression()
                self.eat('RPAREN')
                return ('WRITE', expr)
            elif keyword == 'input':
                self.eat('KEYWORD')
                self.eat('LPAREN')
                prompt = self.parse_expression()
                self.eat('RPAREN')
                return ('INPUT', prompt)
            elif keyword == 'exit':
                self.eat('KEYWORD')
                return ('EXIT',)
            elif keyword == 'variable':
                self.eat('KEYWORD')
                var_name = self.parse_expression()
                self.eat('ASSIGN')
                value = self.parse_expression()
                return ('VARIABLE', var_name, value)

    def parse_expression(self):
        token = self.current_token()
        if token[0] == 'STRING':
            self.eat('STRING')
            return token[1][1:-1]  # Remove the surrounding quotes
        elif token[0] == 'NUMBER':
            self.eat('NUMBER')
            return int(token[1])
        elif token[0] == 'ID':
            var_name = token[1]
            self.eat('ID')
            return var_name
        elif token[0] == 'LPAREN':
            self.eat('LPAREN')
            expr = self.parse_expression()
            self.eat('RPAREN')
            return expr
        else:
            raise SyntaxError(f"Unexpected token: {token}")

    def parse(self):
        statements = []
        while self.pos < len(self.tokens):
            statement = self.parse_statement()
            if statement:
                statements.append(statement)
        return statements

class Interpreter:
    def __init__(self):
        self.variables = {}

    def eval(self, node):
        if node[0] == 'WRITE':
            print(node[1])  # Output the message
        elif node[0] == 'INPUT':
            user_input = input(f"{node[1]}: ")
            return user_input  # Return the input
        elif node[0] == 'EXIT':
            print("Exiting...")
            exit()
        elif node[0] == 'VARIABLE':
            var_name = node[1]
            value = node[2]
            if isinstance(value, int):
                self.variables[var_name] = value
            else:
                self.variables[var_name] = value
            print(f"Assigned {value} to {var_name}")
        else:
            raise ValueError(f"Unknown node type: {node[0]}")

    def execute(self, statements):
        for statement in statements:
            self.eval(statement)

def read_osfl_file(file_path):
    """Read the contents of the .osfl file."""
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist.")
    if not file_path.endswith('.osfl'):
        raise ValueError("The file must have a .osfl extension.")
    
    with open(file_path, 'r') as file:
        return file.read()

def main():
    file_path = input("osfl: ")

    try:
        # Step 1: Read the file
        source_code = read_osfl_file(file_path)

        # Step 2: Lex the source code
        lexer = lex(source_code)

        # Step 3: Parse the lexed tokens
        parser = Parser(lexer)
        statements = parser.parse()

        # Step 4: Execute the parsed statements
        interpreter = Interpreter()
        interpreter.execute(statements)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
