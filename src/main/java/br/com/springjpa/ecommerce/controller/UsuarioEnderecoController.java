package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.EnderecoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.EnderecoResponseDTO;
import br.com.springjpa.ecommerce.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/usuarios/{usuarioId}/enderecos")
public class UsuarioEnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public ResponseEntity<List<EnderecoResponseDTO>> listarEnderecosPorUsuario(@PathVariable Long usuarioId) {
        var enderecos = enderecoService.listarEnderecosPorUsuario(usuarioId);
        return ResponseEntity.ok().body(enderecos);
    }

    @GetMapping("/cidade")
    public ResponseEntity<List<EnderecoResponseDTO>> listarEnderecosPorCidade(
            @PathVariable Long usuarioId, @RequestParam String cidade) {
        var enderecos = enderecoService.listarEnderecosPorUsuarioECidade(usuarioId, cidade);
        return ResponseEntity.ok().body(enderecos);
    }

    @PostMapping
    public ResponseEntity<EnderecoResponseDTO> criarEndereco(
            @PathVariable Long usuarioId, @RequestBody @Valid EnderecoRequestDTO dto) {
        var endereco = enderecoService.criarEndereco(usuarioId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(endereco);
    }
}