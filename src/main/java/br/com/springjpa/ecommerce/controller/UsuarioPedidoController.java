package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.PedidoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.PedidoResponseDTO;
import br.com.springjpa.ecommerce.enums.StatusPedido;
import br.com.springjpa.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("usuarios/{usuarioId}/pedidos")
public class UsuarioPedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorUsuario(@PathVariable Long usuarioId){
        var pedido = pedidoService.listarPedidosPorUsuario(usuarioId);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/ordenados")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorUsuarioOrdenados(@PathVariable Long usuarioId){
        var pedido = pedidoService.listarPedidosPorUsuarioOrdenados(usuarioId);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/status")
    public ResponseEntity<List<PedidoResponseDTO>> getPedidosAtivosPorUsuario(@PathVariable Long usuarioId,@RequestParam StatusPedido status){
        var pedido = pedidoService.getPedidosAtivosPorUsuario(usuarioId, status);
        return ResponseEntity.ok(pedido);
    }

    @PostMapping
    public ResponseEntity<PedidoResponseDTO> criarPedido(@PathVariable Long usuarioId, @RequestBody @Valid PedidoRequestDTO pedidoRequestDTO){
        var pedido = pedidoService.criarPedido(usuarioId, pedidoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }
}
