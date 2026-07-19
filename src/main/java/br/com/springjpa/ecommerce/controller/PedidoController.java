package br.com.springjpa.ecommerce.controller;

import br.com.springjpa.ecommerce.dto.request.AtualizarStatusRequestDTO;
import br.com.springjpa.ecommerce.dto.response.ContagemStatusDTO;
import br.com.springjpa.ecommerce.dto.response.PedidoResponseDTO;
import br.com.springjpa.ecommerce.enums.StatusPedido;
import br.com.springjpa.ecommerce.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidos(){
        var pedido = pedidoService.listarPedidos();
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponseDTO> listarPedidosPorId(@PathVariable Long id){
        var pedido = pedidoService.buscarPedidoPorId(id);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/status")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorStatus(@RequestParam StatusPedido status){
        var pedido = pedidoService.listarPedidosPorStatus(status);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<PedidoResponseDTO>> listarPedidosPorPeriodo(@RequestParam LocalDateTime inicio, @RequestParam LocalDateTime fim){
        var pedido = pedidoService.listarPorPeriodo(inicio, fim);
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List< ContagemStatusDTO>> resumoDashboard(){
        var  pedido = pedidoService.resumoDashboard();
        return ResponseEntity.ok(pedido);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(@PathVariable Long id, @RequestBody @Valid AtualizarStatusRequestDTO dto){
        var pedido = pedidoService.atualizarStatus(id, dto.status());
        return ResponseEntity.ok(pedido);
    }
}