package br.com.springjpa.ecommerce.repository;

import br.com.springjpa.ecommerce.model.ProdutoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<ProdutoEntity, Long> {

    // Produtos de uma categoria
    List<ProdutoEntity> findByCategoriaId(Long categoriaId);

    // Busca por nome
    List<ProdutoEntity> findByNomeContainingIgnoreCase(String nome);

    // Produtos com estoque disponível
    List<ProdutoEntity> findByQuantidadeStockGreaterThan(Integer quantidade);

    // Produtos por categoria com estoque
    List<ProdutoEntity> findByCategoriaIdAndQuantidadeStockGreaterThan(
            Long categoriaId, Integer quantidade);

    // Produtos por faixa de preço
    List<ProdutoEntity> findByPrecoBetween(BigDecimal min, BigDecimal max);

    // Busca combinada (nome + categoria)
    List<ProdutoEntity> findByNomeContainingIgnoreCaseAndCategoriaId(
            String nome, Long categoriaId);
}
