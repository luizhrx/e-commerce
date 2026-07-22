package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.ProdutoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.ProdutoResponseDTO;
import br.com.springjpa.ecommerce.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarTodosProdutos(){
        var produtos = produtoService.listarProdutos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> listarProdutoPorId(@PathVariable Long id){
        var produto = produtoService.listarProdutosPorId(id);
        return ResponseEntity.ok(produto);
    }

    @GetMapping("/nome")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorNome(@RequestParam String nome,@RequestParam(required = false) Long categoriaId){

        if (categoriaId != null) {
            var produto = produtoService.listarProdutosPorNomeECategoria(nome, categoriaId);
            return ResponseEntity.ok(produto);
        }

        var  produtos = produtoService.listarProdutosPorNome(nome);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/categoria/{id}")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorCategoria(@PathVariable Long id){
        var produtos = produtoService.listarProdutosPorCategoria(id);
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosComEstoqueDisponivel(){
        var produto = produtoService.listarProdutosDisponiveis();
        return ResponseEntity.ok(produto);
    }

    @GetMapping("/categoria/{id}/disponiveis")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorCategoriaDisponiveis(@PathVariable Long id){
        var produto = produtoService.listarProdutosPorCategoriaDisponiveis(id);
        return ResponseEntity.ok(produto);
    }

    @GetMapping("/preco")
    public ResponseEntity<List<ProdutoResponseDTO>> listarProdutosPorFaixaDePreco(@RequestParam BigDecimal min, @RequestParam BigDecimal max){
        var produto =  produtoService.listarProdutosPorFaixaDePreco(min, max);
        return ResponseEntity.ok(produto);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponseDTO> criarProduto(
            @RequestPart("dados") @Valid ProdutoRequestDTO dto,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem){

        var produto = produtoService.criarProduto(dto,imagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }

    @PutMapping(value = "/atualizar/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProdutoResponseDTO> atualizarProduto(
            @PathVariable Long id,
            @RequestPart("dados") @Valid ProdutoRequestDTO dto,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem) { // required = false é crucial aqui!

        var produto = produtoService.atualizarProduto(id, dto, imagem);
        return ResponseEntity.ok(produto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarProduto(@PathVariable Long id){
        produtoService.excluirProduto(id);
        return ResponseEntity.noContent().build();
    }

}
