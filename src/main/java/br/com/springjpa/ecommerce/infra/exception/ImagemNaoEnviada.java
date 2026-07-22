package br.com.springjpa.ecommerce.infra.exception;

public class ImagemNaoEnviada extends RuntimeException {
    public ImagemNaoEnviada(String message) {
        super(message);
    }
}
