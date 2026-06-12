package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

    // Busca um usuário pelo email
    Optional<UsuarioEntity> findByEmail(String email);

    // Verifica se um usuário existe pelo email
    boolean existsByEmail(String email);

    // Busca usuários cujo nome contenha uma determinada string, ignorando maiúsculas/minúsculas
    List<UsuarioEntity> findByNomeContainingIgnoreCase(String nome);
}
