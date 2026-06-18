package br.com.springjpa.ecommerce.infra.exception;

public class EntidadeJaCadastrada extends RuntimeException {
    public EntidadeJaCadastrada(String message) {
        super(message);
    }
}
