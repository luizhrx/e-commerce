package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.CategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<CategoriaEntity, Long> {

    // Busca uma categoria pelo nome
    Optional<CategoriaEntity> findByNome(String nome);

    // Verifica se uma categoria existe pelo nome, ignorando maiúsculas/minúsculas
    boolean existsByNomeIgnoreCase(String nome);

    // Busca categorias cujo nome contenha uma determinada string, ignorando maiúsculas/minúsculas
    List<CategoriaEntity> findByNomeContainingIgnoreCase(String nome);

}
