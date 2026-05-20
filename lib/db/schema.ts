import {
  pgTable, uuid, text, boolean, integer,
  decimal, date, time, timestamp, jsonb, index
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================
// cursos
// ============================================
export const cursos = pgTable('cursos', {
  id:              uuid('id').primaryKey().defaultRandom(),
  nome:            text('nome').notNull(),
  slug:            text('slug').notNull().unique(),
  descricao:       text('descricao'),
  categoria:       text('categoria').notNull(),
  fotos:           text('fotos').array().default([]),
  fotoDestaque:    text('foto_destaque'),
  ativo:           boolean('ativo').default(true).notNull(),
  destaque:        boolean('destaque').default(false).notNull(),
  ordemDestaque:   integer('ordem_destaque').default(0).notNull(),
  precoReferencia: decimal('preco_referencia', { precision: 10, scale: 2 }),
  // LMS: preços
  precoVenda:      decimal('preco_venda', { precision: 10, scale: 2 }),
  precoOriginal:   decimal('preco_original', { precision: 10, scale: 2 }),
  // LMS: tipo e evento
  tipoCurso:       text('tipo_curso').default('gravado'), // gravado | presencial | aovivo | formacao
  dataEvento:      date('data_evento'),
  horarioEvento:   text('horario_evento'),
  localEvento:     text('local_evento'),
  // LMS: vagas
  vagasTotal:      integer('vagas_total'),
  vagasOcupadas:   integer('vagas_ocupadas').default(0).notNull(),
  // LMS: acesso
  acessoVitalicio: boolean('acesso_vitalicio').default(true).notNull(),
  diasAcesso:      integer('dias_acesso'), // null = vitalicio
  certificado:     boolean('certificado').default(true).notNull(),
  cargaHoraria:    text('carga_horaria'),
  // Docente
  publicoAlvo:     text('publico_alvo'),
  docenteNome:     text('docente_nome'),
  docenteCargo:    text('docente_cargo'),
  docenteFoto:     text('docente_foto'),
  docenteDesc:     text('docente_desc'),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_cursos_ativo').on(t.ativo),
  index('idx_cursos_destaque').on(t.destaque, t.ordemDestaque),
  index('idx_cursos_categoria').on(t.categoria),
  index('idx_cursos_tipo').on(t.tipoCurso),
])

// ============================================
// leads
// ============================================
export const leads = pgTable('leads', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  nome:                text('nome').notNull(),
  telefone:            text('telefone').notNull(),
  email:               text('email'),
  dataEvento:          date('data_evento'),
  horarioEvento:       text('horario_evento'),
  enderecoEvento:      text('endereco_evento'),
  regiaoEvento:        text('regiao_evento'),
  cursosInteresse: text('cursos_interesse').array().default([]),
  mensagem:            text('mensagem'),
  origem:              text('origem').default('site').notNull(),
  status:              text('status').default('novo').notNull(),
  motivoPerda:         text('motivo_perda'),
  valorProposto:       decimal('valor_proposto', { precision: 10, scale: 2 }),
  valorSinal:          decimal('valor_sinal', { precision: 10, scale: 2 }),
  prioridade:          text('prioridade').default('normal').notNull(),
  ultimaInteracao:     timestamp('ultima_interacao', { withTimezone: true }).defaultNow().notNull(),
  proximoFollowup:     timestamp('proximo_followup', { withTimezone: true }),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_leads_status').on(t.status),
  index('idx_leads_data_evento').on(t.dataEvento),
  index('idx_leads_ultima_interacao').on(t.ultimaInteracao),
])

// ============================================
// interacoes
// ============================================
export const interacoes = pgTable('interacoes', {
  id:             uuid('id').primaryKey().defaultRandom(),
  leadId:         uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  tipo:           text('tipo').notNull(),
  conteudo:       text('conteudo').notNull(),
  statusAnterior: text('status_anterior'),
  statusNovo:     text('status_novo'),
  createdAt:      timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_interacoes_lead').on(t.leadId, t.createdAt),
])

// ============================================
// monitores (funcionários)
// ============================================
export const monitores = pgTable('monitores', {
  id:        uuid('id').primaryKey().defaultRandom(),
  nome:      text('nome').notNull(),
  telefone:  text('telefone').notNull(),
  cpf:       text('cpf'),
  pix:       text('pix'),
  ativo:     boolean('ativo').default(true).notNull(),
  valorDia:  decimal('valor_dia', { precision: 10, scale: 2 }),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_monitores_ativo').on(t.ativo),
])

// ============================================
// eventos (expandido com financeiro)
// ============================================
export const eventos = pgTable('eventos', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  leadId:                uuid('lead_id').references(() => leads.id),
  nomeCliente:           text('nome_cliente').notNull(),
  telefoneCliente:       text('telefone_cliente').notNull(),
  emailCliente:          text('email_cliente'),
  dataEvento:            date('data_evento').notNull(),
  horarioInicio:         time('horario_inicio').notNull(),
  horarioFim:            time('horario_fim'),
  enderecoCompleto:      text('endereco_completo').notNull(),
  regiaoEvento:          text('regiao_evento'),
  cursosContratados: uuid('cursos_contratados').array().default([]),
  // Financeiro
  valorTotal:            decimal('valor_total', { precision: 10, scale: 2 }),
  valorEntrada:          decimal('valor_entrada', { precision: 10, scale: 2 }).default('0'),
  valorRestante:         decimal('valor_restante', { precision: 10, scale: 2 }).default('0'),
  formaPagamento:        text('forma_pagamento').default('pix'),
  statusPagamento:       text('status_pagamento').default('pendente').notNull(),
  // Custos operacionais
  custoMonitores:        decimal('custo_monitores', { precision: 10, scale: 2 }).default('0'),
  custoTransporte:       decimal('custo_transporte', { precision: 10, scale: 2 }).default('0'),
  custosExtras:          decimal('custos_extras', { precision: 10, scale: 2 }).default('0'),
  // Checklists
  checklistMontagem:     jsonb('checklist_montagem').default([]),
  checklistDesmontagem:  jsonb('checklist_desmontagem').default([]),
  // Origem e tipo do cliente (Instagram, indicação, site, etc.)
  origemCliente:         text('origem_cliente'),
  tipoCliente:           text('tipo_cliente'), // fisica | empresa | cerimonialista | locador
  // Status do evento
  status:                text('status').default('orcamento').notNull(),
  observacoes:           text('observacoes'),
  fotosMontagem:         text('fotos_montagem').array().default([]),
  createdAt:             timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:             timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_eventos_data').on(t.dataEvento),
  index('idx_eventos_status').on(t.status),
  index('idx_eventos_status_pag').on(t.statusPagamento),
])

// ============================================
// evento_monitores (junction)
// ============================================
export const eventoMonitores = pgTable('evento_monitores', {
  id:         uuid('id').primaryKey().defaultRandom(),
  eventoId:   uuid('evento_id').notNull().references(() => eventos.id, { onDelete: 'cascade' }),
  monitorId:  uuid('monitor_id').notNull().references(() => monitores.id, { onDelete: 'cascade' }),
  valorPago:  decimal('valor_pago', { precision: 10, scale: 2 }),
  confirmado: boolean('confirmado').default(false).notNull(),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_em_evento').on(t.eventoId),
  index('idx_em_monitor').on(t.monitorId),
])

// ============================================
// pagamentos (parcelas do evento)
// ============================================
export const pagamentos = pgTable('pagamentos', {
  id:          uuid('id').primaryKey().defaultRandom(),
  eventoId:    uuid('evento_id').notNull().references(() => eventos.id, { onDelete: 'cascade' }),
  descricao:   text('descricao').notNull(),
  valor:       decimal('valor', { precision: 10, scale: 2 }).notNull(),
  tipo:        text('tipo').default('receita').notNull(), // receita | despesa
  forma:       text('forma').default('pix'),
  status:      text('status').default('pendente').notNull(), // pendente | recebido | cancelado
  dataPrevista: date('data_prevista'),
  dataRecebido: date('data_recebido'),
  comprovante:  text('comprovante'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_pag_evento').on(t.eventoId),
  index('idx_pag_status').on(t.status),
  index('idx_pag_tipo').on(t.tipo),
])

// ============================================
// usuarios_sistema
// ============================================
export const usuariosSistema = pgTable('usuarios_sistema', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull().unique(),
  nome:         text('nome').notNull(),
  cargo:        text('cargo'),
  role:         text('role').default('operador').notNull(), // admin | operador | financeiro | viewer
  permissoes:   jsonb('permissoes').default({}),
  ativo:        boolean('ativo').default(true).notNull(),
  ultimoAcesso: timestamp('ultimo_acesso', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_usuarios_email').on(t.email),
  index('idx_usuarios_role').on(t.role),
])

// ============================================
// configuracoes
// ============================================
export const configuracoes = pgTable('configuracoes', {
  chave:     text('chave').primaryKey(),
  valor:     text('valor'),
  descricao: text('descricao'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// clientes
// ============================================
export const clientes = pgTable('clientes', {
  id:               uuid('id').primaryKey().defaultRandom(),
  nome:             text('nome').notNull(),
  telefone:         text('telefone').notNull().unique(),
  email:            text('email'),
  cpf:              text('cpf'),
  dataNascimento:   date('data_nascimento'),
  endereco:         text('endereco'),
  cidade:           text('cidade'),
  origem:           text('origem').default('site'),
  tipoCliente:      text('tipo_cliente').default('fisica'), // fisica | empresa | cerimonialista | locador
  nomeEmpresa:      text('nome_empresa'),
  observacoes:      text('observacoes'),
  ativo:            boolean('ativo').default(true).notNull(),
  totalEventos:     integer('total_eventos').default(0).notNull(),
  ultimoEvento:     date('ultimo_evento'),
  // Área do Cliente
  codigoAcesso:     text('codigo_acesso').unique(),         // Código único ex: TWX-A3K7
  cashbackSaldo:    decimal('cashback_saldo', { precision: 10, scale: 2 }).default('0').notNull(),
  cashbackTotal:    decimal('cashback_total', { precision: 10, scale: 2 }).default('0').notNull(), // acumulado histórico
  girosBonus:       integer('giros_bonus').default(0).notNull(),   // giros extras concedidos pelo admin
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_clientes_telefone').on(t.telefone),
  index('idx_clientes_nome').on(t.nome),
  index('idx_clientes_ativo').on(t.ativo),
  index('idx_clientes_codigo').on(t.codigoAcesso),
])

// ============================================
// datas_comemorativas
// ============================================
export const datasComecorativas = pgTable('datas_comemorativas', {
  id:          uuid('id').primaryKey().defaultRandom(),
  clienteId:   uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  nome:        text('nome').notNull(),         // Nome do aniversariante
  relacao:     text('relacao').notNull(),      // filho, filha, conjuge, proprio, etc
  dataNasc:    date('data_nasc').notNull(),    // Data de nascimento
  anoNasc:     integer('ano_nasc'),            // Para calcular idade
  observacoes: text('observacoes'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_dc_cliente').on(t.clienteId),
  index('idx_dc_data').on(t.dataNasc),
])

// ============================================
// lancamentos_financeiros (avulsos)
// ============================================
export const lancamentosFinanceiros = pgTable('lancamentos_financeiros', {
  id:          uuid('id').primaryKey().defaultRandom(),
  eventoId:    uuid('evento_id').references(() => eventos.id, { onDelete: 'set null' }),
  monitorId:   uuid('monitor_id').references(() => monitores.id, { onDelete: 'set null' }),
  tipo:        text('tipo').notNull(), // receita | despesa | retirada_socio | pagamento_monitor
  descricao:   text('descricao').notNull(),
  valor:       decimal('valor', { precision: 10, scale: 2 }).notNull(),
  forma:       text('forma').default('pix'), // pix | dinheiro | transferencia | cartao
  status:      text('status').default('pago').notNull(), // pago | pendente | cancelado
  data:        date('data').notNull(),
  categoria:   text('categoria'), // combustivel, alimentacao, material, etc
  comprovante: text('comprovante'),
  observacoes: text('observacoes'),
  criadoPor:   text('criado_por'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_lf_data').on(t.data),
  index('idx_lf_tipo').on(t.tipo),
  index('idx_lf_evento').on(t.eventoId),
  index('idx_lf_status').on(t.status),
])

// ============================================
// admin_users
// ============================================
export const adminUsers = pgTable('admin_users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nome:         text('nome').notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================
// alunos (portal do aluno — separado de adminUsers)
// ============================================
export const alunos = pgTable('alunos', {
  id:               uuid('id').primaryKey().defaultRandom(),
  nome:             text('nome').notNull(),
  email:            text('email').notNull().unique(),
  senhaHash:        text('senha_hash').notNull(),
  cpf:              text('cpf'),
  telefone:         text('telefone'),
  asaasCustomerId:  text('asaas_customer_id').unique(), // ID do cliente no Asaas
  emailVerificado:  boolean('email_verificado').default(false).notNull(),
  tokenRecuperacao: text('token_recuperacao'),
  tokenExpiracao:   timestamp('token_expiracao', { withTimezone: true }),
  ativo:            boolean('ativo').default(true).notNull(),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_alunos_email').on(t.email),
  index('idx_alunos_asaas').on(t.asaasCustomerId),
])

// ============================================
// pedidos (cada tentativa de compra)
// ============================================
export const pedidos = pgTable('pedidos', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  alunoId:              uuid('aluno_id').notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  cursoId:              uuid('curso_id').notNull().references(() => cursos.id, { onDelete: 'restrict' }),
  valor:                decimal('valor', { precision: 10, scale: 2 }).notNull(),
  formaPagamento:       text('forma_pagamento').notNull(), // pix | cartao | boleto
  parcelas:             integer('parcelas').default(1).notNull(),
  status:               text('status').default('pendente').notNull(), // pendente | pago | cancelado | reembolsado
  // Asaas
  asaasPaymentId:       text('asaas_payment_id').unique(),
  asaasPaymentLink:     text('asaas_payment_link'),
  // PIX
  pixQrCode:            text('pix_qr_code'),     // base64 da imagem
  pixChaveCopiaECola:   text('pix_chave_copia_e_cola'),
  pixExpiracao:         timestamp('pix_expiracao', { withTimezone: true }),
  // Boleto
  boletoUrl:            text('boleto_url'),
  boletoLinhaDigitavel: text('boleto_linha_digitavel'),
  boletoBanco:          text('boleto_banco'),
  // Cartão
  cartaoBandeira:       text('cartao_bandeira'),
  cartaoUltimos4:       text('cartao_ultimos4'),
  // Datas
  paidAt:               timestamp('paid_at', { withTimezone: true }),
  createdAt:            timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_pedidos_aluno').on(t.alunoId),
  index('idx_pedidos_curso').on(t.cursoId),
  index('idx_pedidos_status').on(t.status),
  index('idx_pedidos_asaas').on(t.asaasPaymentId),
])

// ============================================
// matriculas (acesso liberado após pagamento)
// ============================================
export const matriculas = pgTable('matriculas', {
  id:               uuid('id').primaryKey().defaultRandom(),
  alunoId:          uuid('aluno_id').notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  cursoId:          uuid('curso_id').notNull().references(() => cursos.id, { onDelete: 'restrict' }),
  pedidoId:         uuid('pedido_id').references(() => pedidos.id, { onDelete: 'set null' }),
  status:           text('status').default('ativo').notNull(), // ativo | expirado | cancelado
  dataExpiracao:    timestamp('data_expiracao', { withTimezone: true }), // null = vitalicio
  progressoPercent: integer('progresso_percent').default(0).notNull(),
  certificadoUrl:   text('certificado_url'),
  certificadoAt:    timestamp('certificado_at', { withTimezone: true }),
  ultimoAcessoAt:   timestamp('ultimo_acesso_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_matriculas_aluno').on(t.alunoId),
  index('idx_matriculas_curso').on(t.cursoId),
  index('idx_matriculas_status').on(t.status),
])

// ============================================
// modulos (capítulos de um curso)
// ============================================
export const modulos = pgTable('modulos', {
  id:        uuid('id').primaryKey().defaultRandom(),
  cursoId:   uuid('curso_id').notNull().references(() => cursos.id, { onDelete: 'cascade' }),
  titulo:    text('titulo').notNull(),
  descricao: text('descricao'),
  ordem:     integer('ordem').default(0).notNull(),
  ativo:     boolean('ativo').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_modulos_curso').on(t.cursoId, t.ordem),
])

// ============================================
// aulas (vídeos e materiais de cada módulo)
// ============================================
export const aulas = pgTable('aulas', {
  id:           uuid('id').primaryKey().defaultRandom(),
  moduloId:     uuid('modulo_id').notNull().references(() => modulos.id, { onDelete: 'cascade' }),
  cursoId:      uuid('curso_id').notNull().references(() => cursos.id, { onDelete: 'cascade' }),
  titulo:       text('titulo').notNull(),
  descricao:    text('descricao'),
  ordem:        integer('ordem').default(0).notNull(),
  tipo:         text('tipo').default('video').notNull(), // video | pdf | texto | quiz
  // Vídeo (YouTube unlisted, Bunny, Vimeo)
  videoUrl:     text('video_url'),     // URL embed ou ID
  videoProvider: text('video_provider').default('youtube'), // youtube | bunny | vimeo
  videoDuracao:  integer('video_duracao'), // em segundos
  // Material extra
  materialUrl:  text('material_url'),
  conteudoTexto: text('conteudo_texto'), // markdown para aulas de texto
  // Controles
  gratuita:     boolean('gratuita').default(false).notNull(), // preview público
  ativo:        boolean('ativo').default(true).notNull(),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_aulas_modulo').on(t.moduloId, t.ordem),
  index('idx_aulas_curso').on(t.cursoId),
])

// ============================================
// progresso_aluno (tracking de conclusão)
// ============================================
export const progressoAluno = pgTable('progresso_aluno', {
  id:                uuid('id').primaryKey().defaultRandom(),
  alunoId:           uuid('aluno_id').notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  aulaId:            uuid('aula_id').notNull().references(() => aulas.id, { onDelete: 'cascade' }),
  cursoId:           uuid('curso_id').notNull().references(() => cursos.id, { onDelete: 'cascade' }),
  concluida:         boolean('concluida').default(false).notNull(),
  percentualAssistido: integer('percentual_assistido').default(0).notNull(),
  ultimoSegundo:     integer('ultimo_segundo').default(0).notNull(), // para retomar de onde parou
  concluidaAt:       timestamp('concluida_at', { withTimezone: true }),
  updatedAt:         timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_progresso_aluno_aula').on(t.alunoId, t.aulaId),
  index('idx_progresso_aluno_curso').on(t.alunoId, t.cursoId),
])

// ============================================
// aluno_registros (supervisões, sessões e observações)
// ============================================
export const alunoRegistros = pgTable('aluno_registros', {
  id:          uuid('id').primaryKey().defaultRandom(),
  alunoId:     uuid('aluno_id').notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  tipo:        text('tipo').notNull(), // 'supervisao' | 'analise' | 'observacao'
  data:        timestamp('data', { withTimezone: true }).defaultNow().notNull(),
  horas:       integer('horas').default(0).notNull(),
  supervisor:  text('supervisor'), // supervisor ou analista
  conteudo:    text('conteudo').notNull(), // parecer/relato do caso/observações
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_aluno_registros_aluno').on(t.alunoId),
])

// ============================================
// Relations
// ============================================
export const leadsRelations = relations(leads, ({ many }) => ({
  interacoes: many(interacoes),
  eventos:    many(eventos),
}))

export const interacoesRelations = relations(interacoes, ({ one }) => ({
  lead: one(leads, { fields: [interacoes.leadId], references: [leads.id] }),
}))

export const eventosRelations = relations(eventos, ({ one, many }) => ({
  lead:           one(leads, { fields: [eventos.leadId], references: [leads.id] }),
  monitoresEvento: many(eventoMonitores),
  pagamentos:     many(pagamentos),
}))

export const monitoresRelations = relations(monitores, ({ many }) => ({
  eventos: many(eventoMonitores),
}))

export const eventoMonitoresRelations = relations(eventoMonitores, ({ one }) => ({
  evento:  one(eventos,  { fields: [eventoMonitores.eventoId],  references: [eventos.id] }),
  monitor: one(monitores, { fields: [eventoMonitores.monitorId], references: [monitores.id] }),
}))

export const pagamentosRelations = relations(pagamentos, ({ one }) => ({
  evento: one(eventos, { fields: [pagamentos.eventoId], references: [eventos.id] }),
}))

// ============================================
// cashback_transacoes
// ============================================
export const cashbackTransacoes = pgTable('cashback_transacoes', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  clienteId:           uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  eventoId:            uuid('evento_id').references(() => eventos.id, { onDelete: 'set null' }),
  tipo:                text('tipo').notNull(), // 'credito' | 'resgate' | 'expirado'
  valor:               decimal('valor', { precision: 10, scale: 2 }).notNull(),
  percentualAplicado:  decimal('percentual_aplicado', { precision: 5, scale: 2 }),
  descricao:           text('descricao'),
  createdAt:           timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_cashback_cliente').on(t.clienteId),
  index('idx_cashback_evento').on(t.eventoId),
])

// ============================================
// roleta_giros
// ============================================
export const roletaGiros = pgTable('roleta_giros', {
  id:         uuid('id').primaryKey().defaultRandom(),
  clienteId:  uuid('cliente_id').notNull().references(() => clientes.id, { onDelete: 'cascade' }),
  premioNome: text('premio_nome').notNull(),
  premioDesc: text('premio_desc'),
  premioId:   text('premio_id'),
  createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('idx_roleta_cliente').on(t.clienteId),
])

export const clientesRelations = relations(clientes, ({ many }) => ({
  datasComecorativas:   many(datasComecorativas),
  cashbackTransacoes:   many(cashbackTransacoes),
  roletaGiros:          many(roletaGiros),
}))

export const cashbackTransacoesRelations = relations(cashbackTransacoes, ({ one }) => ({
  cliente: one(clientes, { fields: [cashbackTransacoes.clienteId], references: [clientes.id] }),
  evento:  one(eventos,  { fields: [cashbackTransacoes.eventoId],  references: [eventos.id] }),
}))

export const datasComecorativasRelations = relations(datasComecorativas, ({ one }) => ({
  cliente: one(clientes, { fields: [datasComecorativas.clienteId], references: [clientes.id] }),
}))

export const lancamentosFinanceirosRelations = relations(lancamentosFinanceiros, ({ one }) => ({
  evento:  one(eventos,   { fields: [lancamentosFinanceiros.eventoId],  references: [eventos.id] }),
  monitor: one(monitores, { fields: [lancamentosFinanceiros.monitorId], references: [monitores.id] }),
}))

// ── LMS Relations ────────────────────────────────────────────────────────────
export const alunosRelations = relations(alunos, ({ many }) => ({
  pedidos:    many(pedidos),
  matriculas: many(matriculas),
  progresso:  many(progressoAluno),
  registros:  many(alunoRegistros),
}))

export const cursosRelations = relations(cursos, ({ many }) => ({
  modulos:    many(modulos),
  aulas:      many(aulas),
  pedidos:    many(pedidos),
  matriculas: many(matriculas),
}))

export const pedidosRelations = relations(pedidos, ({ one }) => ({
  aluno: one(alunos, { fields: [pedidos.alunoId], references: [alunos.id] }),
  curso: one(cursos, { fields: [pedidos.cursoId], references: [cursos.id] }),
}))

export const matriculasRelations = relations(matriculas, ({ one }) => ({
  aluno:  one(alunos,  { fields: [matriculas.alunoId],  references: [alunos.id] }),
  curso:  one(cursos,  { fields: [matriculas.cursoId],  references: [cursos.id] }),
  pedido: one(pedidos, { fields: [matriculas.pedidoId], references: [pedidos.id] }),
}))

export const modulosRelations = relations(modulos, ({ one, many }) => ({
  curso: one(cursos, { fields: [modulos.cursoId], references: [cursos.id] }),
  aulas: many(aulas),
}))

export const aulasRelations = relations(aulas, ({ one, many }) => ({
  modulo:    one(modulos, { fields: [aulas.moduloId], references: [modulos.id] }),
  curso:     one(cursos,  { fields: [aulas.cursoId],  references: [cursos.id] }),
  progresso: many(progressoAluno),
}))

export const progressoAlunoRelations = relations(progressoAluno, ({ one }) => ({
  aluno: one(alunos, { fields: [progressoAluno.alunoId], references: [alunos.id] }),
  aula:  one(aulas,  { fields: [progressoAluno.aulaId],  references: [aulas.id] }),
  curso: one(cursos, { fields: [progressoAluno.cursoId], references: [cursos.id] }),
}))

export const alunoRegistrosRelations = relations(alunoRegistros, ({ one }) => ({
  aluno: one(alunos, { fields: [alunoRegistros.alunoId], references: [alunos.id] }),
}))
