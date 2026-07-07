package br.com.springjpa.ecommerce.infra.handler;

import br.com.springjpa.ecommerce.dto.response.ErroResponse;
import br.com.springjpa.ecommerce.infra.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import javax.naming.AuthenticationException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class TratadorDeExcecoesGlobais {

    // Tratamento genérico para exceções não tratadas especificamente
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> tratarExcecaoGenerica(Exception ex) {
        ex.printStackTrace();
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Ocorreu um erro interno inesperado no servidor "
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(erro);
    }

    // Tratamento específico para EntidadeJáCadastrada
    @ExceptionHandler(EntidadeJaCadastrada.class)
    public ResponseEntity<ErroResponse> tratarEntidadeJaCadastrada(EntidadeJaCadastrada ex) {
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
    }

    // Tratamento específico para EntidadeNaoEncontrada
    @ExceptionHandler(EntidadeNaoEncontrada.class)
    public ResponseEntity<ErroResponse> tratarEntidadeNaoEncontrada(EntidadeNaoEncontrada ex) {
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro);
    }

    // Tratar erro de sintaxe
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> tratarErrosDeValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                mensagem
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Tratamento específico para EnderecoNaoPertenceAoUsuarioException
    @ExceptionHandler(EnderecoNaoPertenceAoUsuarioException.class)
    public ResponseEntity<ErroResponse> tratarEnderecoNaoPertenceAoUsuario(EnderecoNaoPertenceAoUsuarioException ex){
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erro);
    }

    // Tratamento específico para EstoqueInsuficienteException
    @ExceptionHandler(EstoqueInsuficienteException.class)
    public ResponseEntity<ErroResponse> tratarEstoqueInsuficiente(EstoqueInsuficienteException ex) {
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
    }

    // Tratamento específico para TransicaoStatusInvalidaException
    @ExceptionHandler(TransicaoStatusInvalidaException.class)
    public ResponseEntity<ErroResponse> tratarTransicaoStatusInvalida(TransicaoStatusInvalidaException ex) {
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.CONFLICT.value(),
                ex.getMessage()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro);
    }

    // Tratamento especifico para MethodArgumentTypeMismatchException
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> tratarTipoArgumentoInvalido(MethodArgumentTypeMismatchException ex) {
        String mensagem = "Valor inválido para o parâmetro '" + ex.getName() +
                "': " + ex.getValue();

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                mensagem
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erro);
    }

    // Tratamento específico para token inválido ou expirado
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErroResponse> tratarAuthenticationException(AuthenticationException ex) {
        String mensagem = "Falha na autenticação: token inválido ou expirado";
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                mensagem
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro);
    }

    // Tratamento específico para acesso negado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> tratarAccessDeniedException(AccessDeniedException ex) {
        String mensagem = "Acesso negado: você não tem permissão para acessar este recurso";
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                mensagem
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erro);
    }

    // Tratamento específico para credenciais inválidas
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> tratarBadCredentialsException(BadCredentialsException ex) {
        String mensagem = "Credenciais inválidas: email ou senha incorretos";
        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value(),
                mensagem
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(erro);
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponse> tratarAcessoNegadoException(AcessoNegadoException ex) {
        String mensagem = "Erro ao tentar acessar este recurso";

        ErroResponse erro = new ErroResponse(
                LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value(),
                mensagem
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(erro);
    }


}
