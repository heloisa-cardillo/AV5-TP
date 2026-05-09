import Processo from "../abstracoes/processo";
import Armazem from "../dominio/armazem";
import Acomodacao from "../modelos/acomodacao";
import Cliente from "../modelos/cliente";
import Hospedagem from "../modelos/hospedagem";

export default class CadastroHospedagem extends Processo {
    private hospedagens: Hospedagem[]
    private acomodacoes: Acomodacao[]
    private clientes: Cliente[]

    constructor() {
        super()
        this.hospedagens = Armazem.InstanciaUnica.Hospedagens
        this.acomodacoes = Armazem.InstanciaUnica.Acomodacoes
        this.clientes = Armazem.InstanciaUnica.Clientes
    }

    processar(): void {
        console.clear()
        console.log('=== Cadastro de Hospedagem ===')

        if (this.clientes.length === 0) {
            console.log('Nenhum cliente cadastrado. Cadastre um cliente primeiro.')
            return
        }

        if (this.acomodacoes.length === 0) {
            console.log('Nenhuma acomodação disponível.')
            return
        }

        console.log('\nClientes cadastrados:')
        this.clientes.forEach((cliente, index) => {
            console.log(${index + 1} - )
        })
        const indiceCliente = this.entrada.receberNumero('Selecione o número do cliente:') - 1

        if (indiceCliente < 0 || indiceCliente >= this.clientes.length) {
            console.log('Cliente inválido.')
            return
        }

        console.log('\nAcomodações disponíveis:')
        this.acomodacoes.forEach((acomodacao, index) => {
            console.log(${index + 1} - )
        })
        const indiceAcomodacao = this.entrada.receberNumero('Selecione o número da acomodação:') - 1

        if (indiceAcomodacao < 0 || indiceAcomodacao >= this.acomodacoes.length) {
            console.log('Acomodação inválida.')
            return
        }

        const hospedagem = new Hospedagem(
            this.clientes[indiceCliente],
            this.acomodacoes[indiceAcomodacao]
        )
        this.hospedagens.push(hospedagem)
        console.log(\nHospedagem registrada com sucesso!)
        console.log(Hóspede: )
        console.log(Acomodação: )
    }
}
