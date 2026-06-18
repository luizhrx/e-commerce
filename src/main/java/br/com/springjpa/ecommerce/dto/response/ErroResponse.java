package br.com.springjpa.ecommerce.dto.response;

import java.time.LocalDateTime;

public record ErroResponse(
        LocalDateTime dataHora,
        Integer statusHttp,
        String mensagem
) { }