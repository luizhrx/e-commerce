package br.com.springjpa.ecommerce.service;

import br.com.springjpa.ecommerce.dto.request.ProdutoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.ProdutoResponseDTO;
import br.com.springjpa.ecommerce.infra.exception.EntidadeJaCadastrada;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.infra.exception.ImagemNaoEnviada;
import br.com.springjpa.ecommerce.model.ProdutoEntity;
import br.com.springjpa.ecommerce.repository.CategoriaRepository;
import br.com.springjpa.ecommerce.repository.ItemPedidoRepository;
import br.com.springjpa.ecommerce.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {
    private static final Integer ESTOQUE_MINIMO = 0;
    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final CloudinaryService cloudinaryService;


    // Método para listar todos os produtos
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutos() {
        return produtoRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar produtos por ID
    @Transactional(readOnly = true)
    public ProdutoResponseDTO listarProdutosPorId(Long id) {
        return produtoRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Produto não encontrado"));
    }

    // Método para listar produtos por nome
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorNome(String nome) {
        return produtoRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar produtos por categoria
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorCategoria(Long categoriaId) {
        return produtoRepository.findByCategoriaId(categoriaId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar produtos com estoque disponível
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosDisponiveis() {
        return produtoRepository.findByQuantidadeStockGreaterThan(ESTOQUE_MINIMO).stream() // filtra produtos com estoque maior que 0
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar produtos por categoria com estoque
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorCategoriaDisponiveis(Long categoriaId){
        return produtoRepository.findByCategoriaIdAndQuantidadeStockGreaterThan(categoriaId, 0).stream() // filtra produtos por categoria e estoque maior que 0
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar produtos por faixa de preço
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorFaixaDePreco(BigDecimal min, BigDecimal max) {
        return produtoRepository.findByPrecoBetween(min, max).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para listar produtos por nome e categoria
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorNomeECategoria(String nome, Long categoriaId) {
        return produtoRepository.findByNomeContainingIgnoreCaseAndCategoriaId(nome, categoriaId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Método para criar um novo produto
    public ProdutoResponseDTO criarProduto(ProdutoRequestDTO dto, MultipartFile imagem) {
        var categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new EntidadeNaoEncontrada("Categoria não encontrada"));

        String urlImagem = null;
        if(imagem != null && !imagem.isEmpty()){
            try {
                // Manda a foto pro Cloudinary e pega o link gerado!
                urlImagem = cloudinaryService.uploadImagem(imagem);
            } catch (IOException e) {
                throw new ImagemNaoEnviada("Falha ao enviar a imagem para a nuvem");
            }
        }

        var produto = new ProdutoEntity();
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setQuantidadeStock(dto.quantidadeStock());
        produto.setCategoria(categoria);
        produto.setImagem(urlImagem);

        var produtoSalvo = produtoRepository.save(produto);
        return toResponseDTO(produtoSalvo);
    }

    // Método para atualizar um produto existente
    public ProdutoResponseDTO atualizarProduto(Long id, ProdutoRequestDTO dto, MultipartFile imagem) {
        var produto = produtoRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Produto não encontrado"));

        var categoria = categoriaRepository.findById(dto.categoriaId())
                .orElseThrow(() -> new EntidadeNaoEncontrada("Categoria não encontrada"));

        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPreco(dto.preco());
        produto.setQuantidadeStock(dto.quantidadeStock());
        produto.setCategoria(categoria);

        if (imagem != null && !imagem.isEmpty()) {
            try {
                String urlImagem = cloudinaryService.uploadImagem(imagem);
                produto.setImagem(urlImagem); // Substitui o link do Pinterest pelo novo da nuvem
            } catch (IOException e) {
                throw new ImagemNaoEnviada("Falha ao enviar a nova imagem para a nuvem");
            }
        }
        produto.setImagem(produto.getImagem());

        var produtoAtualizado = produtoRepository.save(produto);
        return toResponseDTO(produtoAtualizado);
    }

    // Método para excluir um produto
    public void excluirProduto(Long id){
        var produto = produtoRepository.findById(id)
                .orElseThrow(()-> new EntidadeNaoEncontrada("Produto não encontrado"));

        if (itemPedidoRepository.existsByProdutoId(id)) {
            throw new EntidadeJaCadastrada("Produto possui itens vinculados");
        }
        produtoRepository.delete(produto);
    }


    private ProdutoResponseDTO toResponseDTO(ProdutoEntity produto) {
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getPreco(),
                produto.getQuantidadeStock(),
                produto.getCategoria().getNome(),
                produto.getImagem()
        );
    }
}
