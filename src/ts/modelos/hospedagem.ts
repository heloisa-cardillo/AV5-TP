import Acomodacao from "./acomodacao";
import Cliente from "./cliente";

export default class Hospedagem {
    private cliente: Cliente
    private acomodacao: Acomodacao
    private dataCheckIn: Date

    constructor(cliente: Cliente, acomodacao: Acomodacao) {
        this.cliente = cliente
        this.acomodacao = acomodacao
        this.dataCheckIn = new Date()
    }

    public get Cliente() { return this.cliente }
    public get Acomodacao() { return this.acomodacao }
    public get DataCheckIn() { return this.dataCheckIn }
}
