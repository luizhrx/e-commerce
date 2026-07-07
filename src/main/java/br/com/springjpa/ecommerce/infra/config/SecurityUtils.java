package br.com.springjpa.ecommerce.infra.config;

import br.com.springjpa.ecommerce.infra.exception.AcessoNegadoException;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.model.UsuarioEntity;
import br.com.springjpa.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    public UsuarioEntity getUsuarioAutenticado() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (!(principal instanceof UsuarioEntity usuario)) {
            throw new EntidadeNaoEncontrada("Usuário não autenticado");
        }

        return usuario;
    }

    public void verificarProprietario(Long usuarioId) {
        UsuarioEntity usuarioAutenticado = getUsuarioAutenticado();

        if (!usuarioAutenticado.getId().equals(usuarioId)) {
            throw new AcessoNegadoException(
                    "Você não tem permissão para acessar este recurso. Apenas o proprietário pode fazer isso."
            );
        }
    }
}
