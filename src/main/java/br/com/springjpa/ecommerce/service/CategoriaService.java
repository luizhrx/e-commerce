package br.com.springjpa.ecommerce.service;

import br.com.springjpa.ecommerce.dto.request.CategoriaRequestDTO;
import br.com.springjpa.ecommerce.dto.response.CategoriaResponseDTO;
import br.com.springjpa.ecommerce.infra.exception.EntidadeJaCadastrada;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.model.CategoriaEntity;
import br.com.springjpa.ecommerce.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    // Método para listar todas as categorias
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarCategorias() {
        List<CategoriaEntity> categorias = categoriaRepository.findAll();
        return categorias.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para buscar uma categoria pelo nome
    @Transactional(readOnly = true)
    public CategoriaResponseDTO buscarCategoriaPorNome(String nome) {
        return categoriaRepository.findByNome(nome)
                .map(this::toResponseDTO)
                .orElseThrow(()-> new EntidadeNaoEncontrada("Categoria não encontrada"));
    }

    // Método para buscar categorias cujo nome contenha uma determinada string
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> buscarCategoriasPorNome(String nome) {
        List<CategoriaEntity> categorias = categoriaRepository.findByNomeContainingIgnoreCase(nome);
        return categorias.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para criar uma nova categoria
    public CategoriaResponseDTO criarCategoria(CategoriaRequestDTO dto) {
        if (categoriaRepository.existsByNomeIgnoreCase(dto.nome())) {
            throw new EntidadeJaCadastrada("Já existe uma categoria com esse nome");
        }
        CategoriaEntity categoria = new CategoriaEntity();
        categoria.setNome(dto.nome());
        CategoriaEntity novaCategoria = categoriaRepository.save(categoria);
        return toResponseDTO(novaCategoria);
    }

    // método para atualizar uma categoria existente
    public CategoriaResponseDTO atualizarCategoria(Long id, CategoriaRequestDTO dto) {
        var categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Categoria não encontrada"));

        if (categoriaRepository.existsByNomeIgnoreCase(dto.nome()) && !categoria.getNome().equalsIgnoreCase(dto.nome())) {
            throw new EntidadeJaCadastrada("Já existe uma categoria com esse nome");
        }

        categoria.setNome(dto.nome());
        CategoriaEntity categoriaAtualizada = categoriaRepository.save(categoria);
        return toResponseDTO(categoriaAtualizada);
    }

    // Método para excluir uma categoria
    public void excluirCategoria(Long id) {
        var categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Categoria não encontrada"));

        if (!categoria.getProdutos().isEmpty()) {
            throw new EntidadeJaCadastrada("Categoria possui produtos vinculados e não pode ser excluída");
        }

        categoriaRepository.delete(categoria);
    }


    private CategoriaResponseDTO toResponseDTO(CategoriaEntity categoria) {
        return new CategoriaResponseDTO(categoria.getId(), categoria.getNome());
    }
}
