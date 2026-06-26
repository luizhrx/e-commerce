package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.EnderecoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.EnderecoResponseDTO;
import br.com.springjpa.ecommerce.service.EnderecoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;

    @GetMapping
    public ResponseEntity<List<EnderecoResponseDTO>> listarEnderecos() {
        var enderecos = enderecoService.listarTodosEnderecos();
        return ResponseEntity.ok().body(enderecos);
    }

    @PutMapping("/{enderecoId}")
    public ResponseEntity<EnderecoResponseDTO> atualizarEndereco(
            @PathVariable Long enderecoId, @RequestBody @Valid EnderecoRequestDTO dto) {
        var endereco = enderecoService.atualizarEndereco(enderecoId, dto);
        return ResponseEntity.ok().body(endereco);
    }

    @DeleteMapping("/{enderecoId}")
    public ResponseEntity<Void> deletarEndereco(@PathVariable Long enderecoId) {
        enderecoService.excluirEndereco(enderecoId);
        return ResponseEntity.noContent().build();
    }
}
