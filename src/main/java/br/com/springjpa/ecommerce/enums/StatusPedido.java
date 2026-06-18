package br.com.springjpa.ecommerce.enums;

public enum StatusPedido {
    PENDENTE,
    PAGO,
    ENVIADO,
    CANCELADO,
    ENTREGUE;

    public boolean podeTransicionarPara(StatusPedido novoStatus) {
        return switch (this) {
            case PENDENTE -> novoStatus == PAGO || novoStatus == CANCELADO;
            case PAGO -> novoStatus == ENVIADO || novoStatus == CANCELADO;
            case ENVIADO -> novoStatus == ENTREGUE;
            case ENTREGUE, CANCELADO -> false;
        };
    }
}
