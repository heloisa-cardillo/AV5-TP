import Processo from "../abstracoes/processo";
import Armazem from "../dominio/armazem";
import Hospedagem from "../modelos/hospedagem";

export default class ListagemHospedagens extends Processo {
    private hospedagens: Hospedagem[]

    constructor() {
        super()
        this.hospedagens = Armazem.InstanciaUnica.Hospedagens
    }

    processar(): void {
        console.clear()
        console.log('=== Hospedes Atualmente Hospedados - Villa dos Coelhos ===')
        console.log('----------------------------------------------------------')

        if (this.hospedagens.length === 0) {
            console.log('Nenhuma hospedagem registrada no momento.')
            return
        }

        this.hospedagens.forEach((hospedagem, index) => {
            console.log('Hospedagem #' + (index + 1))
            console.log('Hospede:      ' + hospedagem.Cliente.Nome)
            console.log('Acomodacao:   ' + hospedagem.Acomodacao.NomeAcomadacao)
            console.log('Check-in:     ' + hospedagem.DataCheckIn.toLocaleDateString('pt-BR'))
            console.log('----------------------------------------------------------')
        })
    }
}