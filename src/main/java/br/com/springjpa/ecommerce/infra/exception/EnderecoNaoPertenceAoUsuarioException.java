package br.com.springjpa.ecommerce.infra.exception;

public class EnderecoNaoPertenceAoUsuarioException extends RuntimeException {
    public EnderecoNaoPertenceAoUsuarioException(String message) {
        super(message);
    }
}
