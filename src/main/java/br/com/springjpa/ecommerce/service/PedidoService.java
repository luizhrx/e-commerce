package br.com.springjpa.ecommerce.service;

import br.com.springjpa.ecommerce.dto.request.ItemPedidoRequestDTO;
import br.com.springjpa.ecommerce.dto.request.PedidoRequestDTO;
import br.com.springjpa.ecommerce.dto.response.*;
import br.com.springjpa.ecommerce.enums.StatusPedido;
import br.com.springjpa.ecommerce.infra.config.SecurityUtils;
import br.com.springjpa.ecommerce.infra.exception.EnderecoNaoPertenceAoUsuarioException;
import br.com.springjpa.ecommerce.infra.exception.EntidadeNaoEncontrada;
import br.com.springjpa.ecommerce.infra.exception.EstoqueInsuficienteException;
import br.com.springjpa.ecommerce.infra.exception.TransicaoStatusInvalidaException;
import br.com.springjpa.ecommerce.model.Endereco;
import br.com.springjpa.ecommerce.model.ItemPedidoEntity;
import br.com.springjpa.ecommerce.model.PedidoEntity;
import br.com.springjpa.ecommerce.repository.EnderecoRepository;
import br.com.springjpa.ecommerce.repository.PedidoRepository;
import br.com.springjpa.ecommerce.repository.ProdutoRepository;
import br.com.springjpa.ecommerce.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EnderecoRepository enderecoRepository;
    private final ProdutoRepository produtoRepository;
    private final SecurityUtils securityUtils;

    // Método para listar todos os pedidos
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidos (){
        return pedidoRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    // Método para listar todos os pedidos de um usuário
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorUsuario(Long id){
        securityUtils.verificarProprietario(id);
        return pedidoRepository.findByUsuarioId(id).stream()
                .map(this::toResponse)
                .toList();
    }

    // Método para listar pedidos com um status especificos
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorStatus(StatusPedido status){
        return pedidoRepository.findByStatus(status).stream()
                .map(this::toResponse)
                .toList();
    }

    // Método para listar todos os pedidos de um usuário com um status específico
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> getPedidosAtivosPorUsuario(Long usuarioId, StatusPedido status){
        return pedidoRepository.findByUsuarioIdAndStatus(usuarioId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    // Método para listar pedidos em um período específico
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorPeriodo(LocalDateTime inicio,  LocalDateTime fim){
        return pedidoRepository.findByDataCriacaoBetween(inicio, fim).stream()
                .map(this::toResponse)
                .toList();
    }

    // Método para listar um pedido pelo Id
    @Transactional(readOnly = true)
    public PedidoResponseDTO buscarPedidoPorId(Long id) {
        var pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido não encontrado"));
        return toResponse(pedido);
    }

    // Método para listar pedidos ordenados por data ( mais recentes primeiro )
    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorUsuarioOrdenados(Long usuarioID){
        return pedidoRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuarioID).stream()
                .map(this::toResponse)
                .toList();
    }

    // Método que retorna a contagem de todos os status
    @Transactional(readOnly = true)
    public List<ContagemStatusDTO> resumoDashboard(){
        return Arrays.stream(StatusPedido.values())
                .map(status -> new ContagemStatusDTO(status, pedidoRepository.countByStatus(status)))
                .toList();
    }


    // Método para criar um pedido
    public PedidoResponseDTO criarPedido(Long usuarioId,PedidoRequestDTO dto){
        securityUtils.verificarProprietario(usuarioId);

        var usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(()-> new EntidadeNaoEncontrada("Usuario não encontrado"));

        var endereco = enderecoRepository.findById(dto.enderecoId())
                .orElseThrow(()-> new EntidadeNaoEncontrada("Endereço não encontrado"));

        // Verifica se o endereço pertence ao usuário
        if (!endereco.getUsuario().getId().equals(usuario.getId())) {
            throw new EnderecoNaoPertenceAoUsuarioException("O endereço não pertence ao usuario ");
        }

        // copiamos os dados em vez de referenciar,
        // porque se o usuário mudar o endereço cadastrado depois, o pedido antigo deve manter o endereço de quando foi feito.
        var enderecoSnapshot = new Endereco(
                endereco.getRua(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado(),
                endereco.getCep()
        );

        // Cria o pedido
        var pedido = new PedidoEntity();
        pedido.setUsuario(usuario);
        pedido.setEnderecoEntrega(enderecoSnapshot);

        // Processa cada item
        for (ItemPedidoRequestDTO itemDto : dto.itens()){
            var produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new EntidadeNaoEncontrada(
                            "Produto não encontrado: " + itemDto.produtoId()));

            if (produto.getQuantidadeStock() < itemDto.quantidade()){
                throw new EstoqueInsuficienteException(
                        "Estoque insuficiente para o produto: " + produto.getNome());
            }

            var item = new ItemPedidoEntity();
            item.setProduto(produto);
            item.setQuantidade(itemDto.quantidade());
            item.setPrecoUnitario(produto.getPreco());

            pedido.adicionarItem(item);

            // Decrementa o estoque
            produto.setQuantidadeStock(produto.getQuantidadeStock() - itemDto.quantidade());
        }

        var pedidoSalvo = pedidoRepository.save(pedido);
        return toResponse(pedidoSalvo);

    }

    // Método para atualizar status
    public PedidoResponseDTO atualizarStatus(Long pedidoId, StatusPedido novoStatus){
        var pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new EntidadeNaoEncontrada("Pedido não encontrado"));

        if (!pedido.getStatus().podeTransicionarPara(novoStatus)){
            throw new TransicaoStatusInvalidaException("Não é possível mudar o status de " + pedido.getStatus() + " para " + novoStatus);
        }

        pedido.setStatus(novoStatus);
        var pedidoAtualizado = pedidoRepository.save(pedido);
        return toResponse(pedidoAtualizado);
    }


    private EnderecoEntregaResposeDTO toEnderecoDTO(Endereco endereco){
        return new EnderecoEntregaResposeDTO(
                endereco.getRua(),
                endereco.getNumero(),
                endereco.getComplemento(),
                endereco.getBairro(),
                endereco.getCidade(),
                endereco.getEstado(),
                endereco.getCep()
        );
    }

    private ItemPedidoResponseDTO toItemDTO(ItemPedidoEntity item){
        return new ItemPedidoResponseDTO(
                item.getId(),
                item.getQuantidade(),
                item.getPrecoUnitario(),
                item.getProduto().getNome(),
                item.getProduto().getDescricao(),
                item.getProduto().getCategoria().getNome()
        );
    }

    private PedidoResponseDTO toResponse(PedidoEntity pedido){
        return new PedidoResponseDTO(
                pedido.getId(),
                pedido.getDataCriacao(),
                pedido.getStatus(),
                pedido.getValorTotal(),
                toEnderecoDTO(pedido.getEnderecoEntrega()),
                pedido.getItens().stream()
                        .map(this::toItemDTO)
                        .toList()
        );
    }
}
