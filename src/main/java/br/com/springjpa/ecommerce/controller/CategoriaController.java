package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.CategoriaRequestDTO;
import br.com.springjpa.ecommerce.dto.response.CategoriaResponseDTO;
import br.com.springjpa.ecommerce.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listarTodasCategorias(){
        var categorias = categoriaService.listarCategorias();
        return ResponseEntity.ok(categorias);
    }

    @GetMapping("/nome")
    public ResponseEntity<CategoriaResponseDTO> listarUmaCategoriaPorNome(@RequestParam String nome){
        var categorias = categoriaService.buscarUmaCategoriaPorNome(nome);
        return ResponseEntity.ok(categorias);
    }

    // Método para buscar categorias cujo nome contenha uma determinada string
    @GetMapping("/busca")
    public ResponseEntity<List<CategoriaResponseDTO>>buscarCategorias(@RequestParam String nome){
        var categorias = categoriaService.buscarCategoriasPorNome(nome);
        return ResponseEntity.ok(categorias);
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> cadastrarCategoria(@RequestBody @Valid CategoriaRequestDTO categoria){
        var categorias = categoriaService.criarCategoria(categoria);
        return ResponseEntity.status(HttpStatus.CREATED).body(categorias);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> atualizarCategoria(@PathVariable Long id, @RequestBody @Valid CategoriaRequestDTO dto){
        var categoria = categoriaService.atualizarCategoria(id, dto);
        return ResponseEntity.ok(categoria);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerCategoria(@PathVariable Long id){
        categoriaService.excluirCategoria(id);
        return ResponseEntity.noContent().build();
    }

}