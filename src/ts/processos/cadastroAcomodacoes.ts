import Processo from "../abstracoes/processo";
import DiretorCasalSimples from "../diretores/diretorCasalSimples";
import DiretorFamiliaMais from "../diretores/diretorFamiliaMais";
import DiretorFamiliaSimples from "../diretores/diretorFamiliaSimples";
import DiretorFamiliaSuper from "../diretores/diretorFamiliaSuper";
import DiretorSolteiroMais from "../diretores/diretorSolteiroMais";
import DiretorSolteiroSimples from "../diretores/diretorSolteiroSimples";
import Armazem from "../dominio/armazem";
import Acomodacao from "../modelos/acomodacao";

export default class CadastroAcomodacoes extends Processo {
    private acomodacoes: Acomodacao[]
    constructor() {
        super()
        this.acomodacoes = Armazem.InstanciaUnica.Acomodacoes
    }
    processar(): void {
        if (this.acomodacoes.length > 0) return
        this.acomodacoes.push(new DiretorSolteiroSimples().construir())
        this.acomodacoes.push(new DiretorSolteiroMais().construir())
        this.acomodacoes.push(new DiretorCasalSimples().construir())
        this.acomodacoes.push(new DiretorFamiliaSimples().construir())
        this.acomodacoes.push(new DiretorFamiliaMais().construir())
        this.acomodacoes.push(new DiretorFamiliaSuper().construir())
    }
}
