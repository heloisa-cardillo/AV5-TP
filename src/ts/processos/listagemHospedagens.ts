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
        console.log('=== Hóspedes Atualmente Hospedados - Villa dos Coelhos ===')
        console.log(----------------------------------------------------------)

        if (this.hospedagens.length === 0) {
            console.log('Nenhuma hospedagem registrada no momento.')
            return
        }

        this.hospedagens.forEach((hospedagem, index) => {
            console.log(Hospedagem #)
            console.log(Hóspede:      )
            console.log(Acomodação:   )
            console.log(Check-in:     )
            console.log(----------------------------------------------------------)
        })
    }
}
