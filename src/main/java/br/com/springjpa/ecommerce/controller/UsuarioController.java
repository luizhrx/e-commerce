package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.UsuarioRequestDTO;
import br.com.springjpa.ecommerce.dto.response.UsuarioResponseDTO;
import br.com.springjpa.ecommerce.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/usuarios")
public class UsuarioController {
    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuarios(){
        var usuario = usuarioService.listarUsuarios();
        return ResponseEntity.ok().body(usuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> listarUsuarioPorId(@PathVariable Long id){
        var usuario = usuarioService.buscarUsuarioPorId(id);
        return ResponseEntity.ok().body(usuario);
    }

    @GetMapping("/email")
    public ResponseEntity<UsuarioResponseDTO> listarUsuarioPorEmail(@RequestParam String email){
        var usuario = usuarioService.buscarUsuarioPorEmail(email);
        return ResponseEntity.ok().body(usuario);
    }

    @GetMapping("/busca")
    public ResponseEntity<List<UsuarioResponseDTO>> listarUsuariosPorNome(@RequestParam String nome){
        var usuario = usuarioService.buscarUsuariosPorNome(nome);
        return ResponseEntity.ok().body(usuario);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastarUsuario(@RequestBody @Valid UsuarioRequestDTO dto){
        var usuario = usuarioService.criarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizarUsuario(@PathVariable Long id, @RequestBody @Valid UsuarioRequestDTO dto){
        var usuario = usuarioService.atualizarUsuario(id, dto);
        return ResponseEntity.ok().body(usuario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id){
        usuarioService.deletarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
