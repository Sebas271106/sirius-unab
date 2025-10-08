import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, GraduationCap, Laptop, Building, ExternalLink } from "lucide-react"

const serviceCategories = [
  {
    id: 1,
    title: "Sistemas de información",
    icon: Laptop,
    description: "Accede a los sistemas principales de la universidad",
    services: [
      {
        name: "Mi Portal U",
        url: "https://miportalu.unab.edu.co/",
        description: "Portal principal del estudiante",
      },
      {
        name: "Cosmos",
        url: "https://cosmos.unab.edu.co/",
        description: "Sistema de gestión académica",
      },
      {
        name: "Correo UNAB",
        url: "https://mail.google.com/a/unab.edu.co",
        description: "Correo institucional",
      },
      {
        name: "Office 365",
        url: "http://portal.office.com/",
        description: "Suite de Microsoft Office",
      },
    ],
  },
  {
    id: 2,
    title: "Servicios digitales",
    icon: Globe,
    description: "Servicios y recursos para estudiantes",
    services: [
      {
        name: "Biblioteca",
        url: "https://unab.edu.co/sistema-de-bibliotecas-unab/",
        description: "Sistema de bibliotecas UNAB",
      },
      {
        name: "Bienestar U",
        url: "https://bienestar.unab.edu.co/",
        description: "Servicios de bienestar universitario",
      },
      {
        name: "Trámites",
        url: "https://unab.edu.co/estudiantes/#tramites",
        description: "Gestión de trámites estudiantiles",
      },
      {
        name: "Contraseña Usuario UNAB",
        url: "https://correo.unab.edu.co/recuperarClave.jsp",
        description: "Recuperación de contraseña",
      },
    ],
  },
  {
    id: 3,
    title: "Plataformas para el aprendizaje",
    icon: GraduationCap,
    description: "Herramientas educativas y de colaboración",
    services: [
      {
        name: "Canvas",
        url: "https://canvas.unab.edu.co/",
        description: "Plataforma de aprendizaje virtual",
      },
      {
        name: "Teams",
        url: "https://www.microsoft.com/es-co/microsoft-365/microsoft-teams/group-chat-software",
        description: "Colaboración y videoconferencias",
      },
      {
        name: "TEMA Pregrado",
        url: "https://tema.unab.edu.co/",
        description: "Plataforma TEMA para pregrado",
      },
      {
        name: "TEMA Posgrado",
        url: "https://temaposgrados.unab.edu.co/",
        description: "Plataforma TEMA para posgrado",
      },
    ],
  },
  {
    id: 4,
    title: "Portales",
    icon: Building,
    description: "Portales institucionales de la universidad",
    services: [
      {
        name: "unab.edu.co",
        url: "https://www.unab.edu.co/",
        description: "Portal principal de la universidad",
      },
      {
        name: "UNAB Virtual",
        url: "https://unabvirtual.unab.edu.co/",
        description: "Educación virtual UNAB",
      },
      {
        name: "Impulsa",
        url: "https://unab.edu.co/impulsa",
        description: "Centro de emprendimiento",
      },
    ],
  },
]

export default function ServicesPage() {
  
  return (
     <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl text-foreground mb-2">Servicios Universitarios</h1>
          <p className="text-muted-foreground">
            Accede a todos los servicios y plataformas de la Universidad Autónoma de Bucaramanga
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {serviceCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.services.map((service, index) => (
                      <a
                        key={index}
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <ExternalLink className="w-4 h-4 text-primary mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {service.name}
                          </div>
                          <div className="text-sm text-muted-foreground">{service.description}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
  )
}