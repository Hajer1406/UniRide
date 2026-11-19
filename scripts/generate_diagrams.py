import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Ellipse, Rectangle, Polygon
import os

OUT_DIR = "docs/diagrammes"
os.makedirs(OUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# BASE PLOT HELPERS
# -------------------------------------------------------------
def create_base_fig(w=16, h=10, title=""):
    fig, ax = plt.subplots(figsize=(w, h), dpi=220)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    if title:
        fig.text(0.5, 0.965, title, ha='center', va='top', fontsize=13, fontweight='bold', fontfamily='sans-serif', color='#0f172a')
    return fig, ax

def save_fig(fig, base_name):
    png_path = os.path.join(OUT_DIR, f"{base_name}.png")
    svg_path = os.path.join(OUT_DIR, f"{base_name}.svg")
    fig.savefig(png_path, bbox_inches='tight', dpi=220, facecolor='white')
    fig.savefig(svg_path, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"Generated: {png_path} & {svg_path}")

# -------------------------------------------------------------
# USE CASE HELPERS
# -------------------------------------------------------------
def draw_actor(ax, x, y, name, scale=1.0):
    head_r = 2.0 * scale
    ax.add_patch(patches.Circle((x, y + 4.5 * scale), head_r, fill=False, edgecolor='#0f172a', linewidth=1.5, zorder=10))
    ax.plot([x, x], [y + 2.5 * scale, y - 2.2 * scale], color='#0f172a', linewidth=1.5, zorder=10)
    ax.plot([x - 3.2 * scale, x + 3.2 * scale], [y + 1.0 * scale, y + 1.0 * scale], color='#0f172a', linewidth=1.5, zorder=10)
    ax.plot([x, x - 2.8 * scale], [y - 2.2 * scale, y - 6.8 * scale], color='#0f172a', linewidth=1.5, zorder=10)
    ax.plot([x, x + 2.8 * scale], [y - 2.2 * scale, y - 6.8 * scale], color='#0f172a', linewidth=1.5, zorder=10)
    ax.text(x, y - 8.5 * scale, name, ha='center', va='top', fontsize=9.5, fontweight='bold', fontfamily='sans-serif', color='#0f172a', zorder=10)

def draw_usecase(ax, x, y, w, h, text, is_auth=False, is_main=False):
    edgecolor = '#1d4ed8' if is_main else ('#047857' if is_auth else '#334155')
    facecolor = '#eff6ff' if is_main else ('#ecfdf5' if is_auth else '#ffffff')
    lw = 2.0 if (is_main or is_auth) else 1.2
    ellipse = Ellipse((x, y), w, h, facecolor=facecolor, edgecolor=edgecolor, linewidth=lw, zorder=4)
    ax.add_patch(ellipse)
    fontweight = 'bold' if (is_main or is_auth) else 'normal'
    color = '#1e3a8a' if is_main else ('#065f46' if is_auth else '#0f172a')
    ax.text(x, y, text, ha='center', va='center', fontsize=9, fontweight=fontweight, fontfamily='sans-serif', color=color, zorder=5)

def draw_system_boundary(ax, x, y, w, h, title="Système UniRide"):
    rect = Rectangle((x, y), w, h, facecolor='#f8fafc', edgecolor='#94a3b8', linewidth=1.2, linestyle='-', zorder=1)
    ax.add_patch(rect)
    ax.text(x + 2, y + h - 2.5, title, fontsize=10.5, fontweight='bold', fontfamily='sans-serif', color='#475569', zorder=2)

def draw_link(ax, x1, y1, x2, y2):
    ax.plot([x1, x2], [y1, y2], color='#1e293b', linewidth=1.3, zorder=2)

def draw_include(ax, x1, y1, x2, y2, label="«include»"):
    # Dashed arrow from source (x1, y1) to target (x2, y2)
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", linestyle="--", color="#1d4ed8", linewidth=1.3, mutation_scale=13),
                zorder=3)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    ax.text(mx, my, label, ha='center', va='center', fontsize=8, fontstyle='italic',
            bbox=dict(boxstyle="square,pad=0.2", facecolor="#ffffff", edgecolor="#bfdbfe", alpha=0.95),
            color="#1e40af", zorder=6)

def draw_extend(ax, x1, y1, x2, y2, label="«extend»"):
    # Extension points from extension to base use case (x1, y1 -> x2, y2)
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", linestyle="--", color="#64748b", linewidth=1.3, mutation_scale=13),
                zorder=3)
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    ax.text(mx, my, label, ha='center', va='center', fontsize=8, fontstyle='italic',
            bbox=dict(boxstyle="square,pad=0.2", facecolor="#ffffff", edgecolor="#e2e8f0", alpha=0.95),
            color="#475569", zorder=6)

# -------------------------------------------------------------
# CLASS DIAGRAM HELPERS
# -------------------------------------------------------------
def draw_class_box(ax, x, y, w, name, attributes, methods, fill_color="#ffffff", header_color="#f8fafc"):
    line_h = 2.1
    pad = 1.4
    h_title = 3.6
    h_attrs = len(attributes) * line_h + pad
    h_meths = len(methods) * line_h + pad
    total_h = h_title + h_attrs + h_meths
    
    top = y
    bottom = y - total_h
    
    # Outer rectangle
    rect = Rectangle((x, bottom), w, total_h, facecolor=fill_color, edgecolor="#0f172a", linewidth=1.3, zorder=3)
    ax.add_patch(rect)
    
    # Title box
    head_rect = Rectangle((x, top - h_title), w, h_title, facecolor=header_color, edgecolor="#0f172a", linewidth=1.3, zorder=3)
    ax.add_patch(head_rect)
    ax.text(x + w/2, top - h_title/2, name, ha='center', va='center', fontsize=9.5, fontweight='bold', fontfamily='sans-serif', color='#0f172a', zorder=5)
    
    # Separator 1
    ax.plot([x, x + w], [top - h_title, top - h_title], color='#0f172a', linewidth=1.1, zorder=4)
    
    # Attributes
    curr_y = top - h_title - 1.2
    for attr in attributes:
        ax.text(x + 0.8, curr_y, attr, ha='left', va='top', fontsize=8, fontfamily='monospace', color='#334155', zorder=5)
        curr_y -= line_h
        
    # Separator 2
    ax.plot([x, x + w], [top - h_title - h_attrs, top - h_title - h_attrs], color='#0f172a', linewidth=1.1, zorder=4)
    
    # Methods
    curr_y = top - h_title - h_attrs - 1.2
    for meth in methods:
        ax.text(x + 0.8, curr_y, meth, ha='left', va='top', fontsize=8, fontfamily='monospace', color='#0f172a', zorder=5)
        curr_y -= line_h
        
    return {
        'top': top, 'bottom': bottom, 'left': x, 'right': x + w,
        'cx': x + w/2, 'cy': y - total_h/2,
        'tc': (x + w/2, top), 'bc': (x + w/2, bottom),
        'lc': (x, y - total_h/2), 'rc': (x + w, y - total_h/2),
        'h': total_h, 'w': w
    }

def draw_inheritance(ax, child_pt, parent_pt):
    # Line from child to parent base of triangle
    x1, y1 = child_pt
    x2, y2 = parent_pt
    # Draw open triangle at parent
    tri_len = 2.2
    tri_w = 1.4
    if y2 > y1: # parent above
        py = y2 - tri_len
        ax.plot([x1, x2], [y1, py], color='#0f172a', linewidth=1.3, zorder=2)
        tri = Polygon([[x2, y2], [x2 - tri_w, py], [x2 + tri_w, py]], closed=True, facecolor='white', edgecolor='#0f172a', linewidth=1.3, zorder=4)
        ax.add_patch(tri)
    elif y2 < y1: # parent below
        py = y2 + tri_len
        ax.plot([x1, x2], [y1, py], color='#0f172a', linewidth=1.3, zorder=2)
        tri = Polygon([[x2, y2], [x2 - tri_w, py], [x2 + tri_w, py]], closed=True, facecolor='white', edgecolor='#0f172a', linewidth=1.3, zorder=4)
        ax.add_patch(tri)
    elif x2 > x1: # parent right
        px = x2 - tri_len
        ax.plot([x1, px], [y1, y2], color='#0f172a', linewidth=1.3, zorder=2)
        tri = Polygon([[x2, y2], [px, y2 - tri_w], [px, y2 + tri_w]], closed=True, facecolor='white', edgecolor='#0f172a', linewidth=1.3, zorder=4)
        ax.add_patch(tri)
    else: # parent left
        px = x2 + tri_len
        ax.plot([x1, px], [y1, y2], color='#0f172a', linewidth=1.3, zorder=2)
        tri = Polygon([[x2, y2], [px, y2 - tri_w], [px, y2 + tri_w]], closed=True, facecolor='white', edgecolor='#0f172a', linewidth=1.3, zorder=4)
        ax.add_patch(tri)

def draw_assoc(ax, pt1, pt2, mult1="1", mult2="0..*", label="", offset_y=1.2):
    x1, y1 = pt1
    x2, y2 = pt2
    ax.plot([x1, x2], [y1, y2], color='#0f172a', linewidth=1.2, zorder=2)
    # Multiplicities
    ax.text(x1 + (1.2 if x2 >= x1 else -1.2), y1 + (0.8 if y2 >= y1 else -0.8), mult1, fontsize=8, fontweight='bold', color='#334155', zorder=5)
    ax.text(x2 + (-1.8 if x2 >= x1 else 1.8), y2 + (-1.2 if y2 >= y1 else 1.2), mult2, fontsize=8, fontweight='bold', color='#334155', zorder=5)
    # Label
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + offset_y
        ax.text(mx, my, label, ha='center', va='center', fontsize=8, fontstyle='italic',
                bbox=dict(boxstyle="square,pad=0.15", facecolor="#ffffff", edgecolor="none", alpha=0.9),
                color="#0f172a", zorder=5)

def draw_composition(ax, owner_pt, owned_pt, mult_owner="1", mult_owned="1", label=""):
    x1, y1 = owner_pt
    x2, y2 = owned_pt
    d_len = 1.6
    d_w = 1.0
    # Filled diamond at owner_pt
    if x2 > x1:
        dx = x1 + d_len * 2
        ax.plot([dx, x2], [y1, y2], color='#0f172a', linewidth=1.2, zorder=2)
        diamond = Polygon([[x1, y1], [x1 + d_len, y1 + d_w], [dx, y1], [x1 + d_len, y1 - d_w]], closed=True, facecolor='#0f172a', edgecolor='#0f172a', zorder=4)
        ax.add_patch(diamond)
    else:
        dx = x1 - d_len * 2
        ax.plot([dx, x2], [y1, y2], color='#0f172a', linewidth=1.2, zorder=2)
        diamond = Polygon([[x1, y1], [x1 - d_len, y1 + d_w], [dx, y1], [x1 - d_len, y1 - d_w]], closed=True, facecolor='#0f172a', edgecolor='#0f172a', zorder=4)
        ax.add_patch(diamond)
    ax.text(x1 + (2.5 if x2 >= x1 else -2.5), y1 + 0.9, mult_owner, fontsize=8, fontweight='bold', color='#334155', zorder=5)
    ax.text(x2 + (-1.8 if x2 >= x1 else 1.8), y2 + 0.9, mult_owned, fontsize=8, fontweight='bold', color='#334155', zorder=5)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + 1.2
        ax.text(mx, my, label, ha='center', va='center', fontsize=8, fontstyle='italic',
                bbox=dict(boxstyle="square,pad=0.15", facecolor="#ffffff", edgecolor="none", alpha=0.9),
                color="#0f172a", zorder=5)

print("Base graphics engine loaded")

# =============================================================
# SPRINT 1 : AUTHENTIFICATION & PROFIL ÉTUDIANT
# =============================================================
def generate_sprint1_usecase():
    fig, ax = create_base_fig(w=15, h=10, title="UniRide — Sprint 1 : Diagramme des Cas d'Utilisation (Authentification & Profil)")
    draw_system_boundary(ax, 20, 5, 76, 88, "UniRide — Module Profil & Authentification")
    
    # Actor
    draw_actor(ax, 10, 52, "Étudiant\n(Membre ISET)", scale=1.1)
    
    # Auth Use Case (Top Center)
    draw_usecase(ax, 58, 82, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Principal Use Case 1 : Gérer son profil
    draw_usecase(ax, 42, 54, 21, 8.5, "gérer son profil\nétudiant", is_main=True)
    draw_link(ax, 14, 52, 31.5, 54)
    # «include» to s'authentifier
    draw_include(ax, 46, 58.2, 55, 78.5, "«include»")
    
    # Extensions for Gérer profil
    draw_usecase(ax, 82, 68, 22, 6.5, "modifier coordonnées\net photo")
    draw_extend(ax, 71, 66, 52, 56.5, "«extend»")
    
    draw_usecase(ax, 82, 58, 22, 6.5, "définir préférences\n(fumeur, musique, mixité)")
    draw_extend(ax, 71, 57.5, 52.5, 54.5, "«extend»")
    
    draw_usecase(ax, 82, 48, 22, 6.5, "importer emploi\ndu temps")
    draw_extend(ax, 71, 49, 52, 52.5, "«extend»")
    
    draw_usecase(ax, 82, 38, 22, 6.5, "supprimer son\ncompte")
    draw_extend(ax, 71, 40.5, 51, 50.5, "«extend»")
    
    # Public Use Cases (Before auth)
    # S'inscrire
    draw_usecase(ax, 42, 25, 19, 7.5, "s'inscrire", is_main=False)
    draw_link(ax, 14, 48, 32.5, 26)
    draw_usecase(ax, 78, 25, 22, 6.5, "vérifier e-mail\nacadémique @isetn.tn")
    draw_include(ax, 51.5, 25, 67, 25, "«include»")
    
    # Mot de passe oublié
    draw_usecase(ax, 42, 12, 21, 7.5, "récupérer mot\nde passe oublié", is_main=False)
    draw_link(ax, 14, 46, 31.5, 13)
    draw_usecase(ax, 78, 12, 22, 6.5, "recevoir code de\nréinitialisation par e-mail")
    draw_include(ax, 52.5, 12, 67, 12, "«include»")
    
    save_fig(fig, "sprint1_usecase")

def generate_sprint1_classes():
    fig, ax = create_base_fig(w=15, h=10, title="UniRide — Sprint 1 : Diagramme de Classes (Authentification & Profil)")
    
    # User Class
    user_attrs = [
        "+_id: ObjectId",
        "+nom: string",
        "+prenom: string",
        "+email: string",
        "+password: string",
        "+telephone: string",
        "+departement: string",
        "+role: string = 'student'",
        "+isVerified: boolean",
        "+resetPasswordCode: string",
        "+resetPasswordExpires: Date"
    ]
    user_meths = [
        "+sInscrire(): boolean",
        "+sAuthentifier(email, mdp): string",
        "+reinitialiserMdp(code, newMdp): boolean",
        "+modifierProfil(donnees): void",
        "+importerEmploiDuTemps(file): void",
        "+supprimerCompte(): boolean"
    ]
    box_user = draw_class_box(ax, 8, 90, 36, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Preferences Class
    pref_attrs = [
        "+fumeur: boolean = false",
        "+musique: boolean = true",
        "+discussion: boolean = true",
        "+climatisation: boolean = true",
        "+mixite: string = 'tous'"
    ]
    pref_meths = [
        "+mettreAJour(prefs): void",
        "+getPreferences(): Object"
    ]
    box_pref = draw_class_box(ax, 56, 90, 34, "Preferences", pref_attrs, pref_meths, header_color="#ecfdf5")
    
    # EmploiDuTemps Class
    edt_attrs = [
        "+_id: ObjectId",
        "+etudiantId: ObjectId",
        "+jour: string",
        "+heureDebut: string",
        "+heureFin: string",
        "+filiere: string",
        "+groupe: string"
    ]
    edt_meths = [
        "+analyserCreneaux(): Array",
        "+estCompatible(trajetDate): boolean"
    ]
    box_edt = draw_class_box(ax, 56, 48, 34, "EmploiDuTemps", edt_attrs, edt_meths, header_color="#fef3c7")
    
    # Composition User *-- Preferences
    draw_composition(ax, (box_user['right'], box_user['top'] - 12), (box_pref['left'], box_pref['top'] - 12), mult_owner="1", mult_owned="1", label="possède >")
    
    # Association User 1 -- 0..* EmploiDuTemps
    draw_assoc(ax, (box_user['right'], box_user['bottom'] + 10), (box_edt['left'], box_edt['cy']), mult1="1", mult2="0..*", label="dispose de >")
    
    save_fig(fig, "sprint1_classes")

print("Sprint 1 diagrams code ready")

# =============================================================
# SPRINT 2 : PUBLICATION & GESTION DES TRAJETS CONDUCTEUR
# =============================================================
def generate_sprint2_usecase():
    fig, ax = create_base_fig(w=15, h=10, title="UniRide — Sprint 2 : Diagramme des Cas d'Utilisation (Gestion des Trajets Conducteur)")
    draw_system_boundary(ax, 22, 6, 74, 86, "UniRide — Module Conducteur & Trajets")
    
    # Actor
    draw_actor(ax, 11, 50, "Conducteur\n(Étudiant Véhiculé)", scale=1.1)
    
    # Auth Use Case (Top Center)
    draw_usecase(ax, 60, 84, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Principal Use Case 1 : Gérer ses trajets
    draw_usecase(ax, 43, 60, 21, 8.5, "gérer ses\ntrajets", is_main=True)
    draw_link(ax, 15, 52, 32.5, 60)
    # «include» s'authentifier
    draw_include(ax, 47, 64.2, 57, 80.5, "«include»")
    
    # Extensions for Gérer trajets
    draw_usecase(ax, 81, 74, 21, 6.5, "publier un nouveau\ntrajet")
    draw_extend(ax, 70.5, 72, 53.5, 62.5, "«extend»")
    
    draw_usecase(ax, 81, 64, 21, 6.5, "consulter ses trajets\nen cours")
    draw_extend(ax, 70.5, 63.5, 54, 60.5, "«extend»")
    
    draw_usecase(ax, 81, 54, 21, 6.5, "modifier détails\nd'un trajet")
    draw_extend(ax, 70.5, 55, 53.5, 58.5, "«extend»")
    
    draw_usecase(ax, 81, 44, 21, 6.5, "annuler un trajet\nprogrammé")
    draw_extend(ax, 70.5, 46.5, 52.5, 56.5, "«extend»")
    
    # Sub-extension : Définir étapes et prix symbolique
    draw_usecase(ax, 81, 84, 21, 6.5, "définir étapes &\nprix symbolique")
    draw_extend(ax, 70.5, 83, 81, 77.5, "«extend»")
    
    # Principal Use Case 2 : Gérer son véhicule
    draw_usecase(ax, 43, 24, 21, 8.5, "gérer son\nvéhicule", is_main=True)
    draw_link(ax, 15, 47, 32.5, 24)
    # «include» s'authentifier
    draw_include(ax, 45, 28.5, 59, 80.2, "«include»")
    
    draw_usecase(ax, 81, 24, 22, 6.5, "enregistrer marque,\nmodèle & immatriculation")
    draw_extend(ax, 70, 24, 53.5, 24, "«extend»")
    
    save_fig(fig, "sprint2_usecase")

def generate_sprint2_classes():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 2 : Diagramme de Classes (Trajets & Véhicule)")
    
    # User (Parent)
    user_attrs = ["+_id: ObjectId", "+nom: string", "+prenom: string", "+email: string", "+telephone: string"]
    user_meths = ["+sAuthentifier(): string", "+modifierProfil(): void"]
    box_user = draw_class_box(ax, 6, 92, 28, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Conducteur (Child)
    cond_attrs = ["+permisValide: boolean = true", "+noteMoyenne: float", "+nbTrajetsConducteur: int"]
    cond_meths = ["+creerTrajet(trajet): Trajet", "+modifierTrajet(id, data): void", "+annulerTrajet(id): void"]
    box_cond = draw_class_box(ax, 6, 52, 28, "Conducteur", cond_attrs, cond_meths, header_color="#eff6ff")
    
    # Inheritance Conducteur -> User
    draw_inheritance(ax, box_cond['tc'], box_user['bc'])
    
    # Vehicule
    veh_attrs = ["+marque: string", "+modele: string", "+immatriculation: string", "+placesTotales: int = 4"]
    veh_meths = ["+getDetailsVehicule(): string", "+mettreAJour(data): void"]
    box_veh = draw_class_box(ax, 42, 52, 26, "Vehicule", veh_attrs, veh_meths, header_color="#fef3c7")
    
    # Composition Conducteur *-- Vehicule
    draw_composition(ax, (box_cond['right'], box_cond['cy']), (box_veh['left'], box_veh['cy']), mult_owner="1", mult_owned="0..1", label="conduit >")
    
    # Trajet
    traj_attrs = [
        "+_id: ObjectId",
        "+conducteurId: ObjectId",
        "+depart: string",
        "+destination: string",
        "+dateDepart: Date",
        "+heureDepart: string",
        "+placesDisponibles: int",
        "+prixParPlace: float",
        "+statut: string = 'actif'",
        "+fumeur: boolean",
        "+climatise: boolean"
    ]
    traj_meths = [
        "+publier(): boolean",
        "+mettreAJour(data): void",
        "+annuler(): void",
        "+reduirePlaces(nb): boolean"
    ]
    box_traj = draw_class_box(ax, 74, 92, 24, "Trajet", traj_attrs, traj_meths, header_color="#ecfdf5")
    
    # Association Conducteur 1 -- 0..* Trajet
    draw_assoc(ax, (box_cond['right'], box_cond['top'] - 6), (box_traj['left'], box_traj['bottom'] + 12), mult1="1", mult2="0..*", label="propose >")
    
    # Etape
    etape_attrs = ["+lieu: string", "+ordre: int", "+heureEstimee: string"]
    etape_meths = ["+getEtape(): string"]
    box_etape = draw_class_box(ax, 74, 34, 24, "Etape", etape_attrs, etape_meths, header_color="#f1f5f9")
    
    # Composition Trajet *-- Etape
    draw_composition(ax, (box_traj['cx'], box_traj['bottom']), (box_etape['cx'], box_etape['top']), mult_owner="1", mult_owned="0..*", label="comporte v")
    
    save_fig(fig, "sprint2_classes")

# =============================================================
# SPRINT 3 : RECHERCHE INTELLIGENTE & RÉSERVATION PASSAGER
# =============================================================
def generate_sprint3_usecase():
    fig, ax = create_base_fig(w=16, h=11, title="UniRide — Sprint 3 : Diagramme des Cas d'Utilisation (Recherche & Réservation)")
    draw_system_boundary(ax, 22, 5, 56, 88, "UniRide — Module Réservation & Recherche")
    
    # Actors
    draw_actor(ax, 10, 68, "Passager\n(Étudiant)", scale=1.05)
    draw_actor(ax, 10, 24, "Conducteur\n(Étudiant)", scale=1.05)
    
    # Auth Use Case (Top Center)
    draw_usecase(ax, 50, 84, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Principal Use Case 1 : Rechercher un trajet (Passager)
    draw_usecase(ax, 38, 68, 20, 8, "rechercher\nun trajet", is_main=True)
    draw_link(ax, 15, 68, 28, 68)
    draw_include(ax, 41, 72, 48, 80.5, "«include»")
    
    # Extensions Rechercher
    draw_usecase(ax, 68, 78, 18, 6.5, "filtrer par date,\nheure & ville")
    draw_extend(ax, 59, 76, 47.5, 71, "«extend»")
    
    draw_usecase(ax, 68, 68, 18, 6.5, "filtrer selon\nemploi du temps")
    draw_extend(ax, 59, 68, 48, 68, "«extend»")
    
    draw_usecase(ax, 68, 58, 18, 6.5, "consulter profil\ndu conducteur")
    draw_extend(ax, 59, 60, 47.5, 65, "«extend»")
    
    # Principal Use Case 2 : Gérer ses réservations (Passager)
    draw_usecase(ax, 38, 44, 20, 8, "gérer ses\nréservations", is_main=True)
    draw_link(ax, 15, 65, 28, 46)
    draw_include(ax, 41, 48, 49, 80.5, "«include»")
    
    # Extensions Réservations
    draw_usecase(ax, 68, 48, 18, 6.5, "réserver des\nplaces")
    draw_extend(ax, 59, 47, 48, 45, "«extend»")
    
    draw_usecase(ax, 68, 38, 18, 6.5, "suivre statut\n(confirmée/attente)")
    draw_extend(ax, 59, 39, 48, 43, "«extend»")
    
    draw_usecase(ax, 68, 28, 18, 6.5, "annuler sa\nréservation")
    draw_extend(ax, 59, 31, 47.5, 41, "«extend»")
    
    # Principal Use Case 3 : Gérer demandes passagers (Conducteur)
    draw_usecase(ax, 38, 15, 21, 8, "gérer les demandes\nde réservation", is_main=True)
    draw_link(ax, 15, 24, 27.5, 16)
    draw_include(ax, 40, 19, 49.5, 80.5, "«include»")
    
    # Extensions Conducteur Demandes
    draw_usecase(ax, 68, 18, 18, 6.5, "accepter la\nréservation")
    draw_extend(ax, 59, 17.5, 48.5, 16, "«extend»")
    
    draw_usecase(ax, 68, 9, 18, 6.5, "refuser la\nréservation")
    draw_extend(ax, 59, 11, 48, 14, "«extend»")
    
    save_fig(fig, "sprint3_usecase")

def generate_sprint3_classes():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 3 : Diagramme de Classes (Recherche & Réservations)")
    
    # User (Parent)
    user_attrs = ["+_id: ObjectId", "+nom: string", "+prenom: string", "+email: string", "+role: string"]
    user_meths = ["+sAuthentifier(): string"]
    box_user = draw_class_box(ax, 34, 94, 28, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Passager (Child)
    pass_attrs = ["+totalReservations: int"]
    pass_meths = [
        "+rechercherTrajets(criteres): Array",
        "+reserverTrajet(trajetId, places): Reservation",
        "+annulerReservation(id): boolean"
    ]
    box_pass = draw_class_box(ax, 4, 62, 30, "Passager", pass_attrs, pass_meths, header_color="#eff6ff")
    
    # Conducteur (Child)
    cond_attrs = ["+nbTrajets: int"]
    cond_meths = [
        "+repondreReservation(id, decision): void"
    ]
    box_cond = draw_class_box(ax, 64, 62, 30, "Conducteur", cond_attrs, cond_meths, header_color="#eff6ff")
    
    # Inheritance
    draw_inheritance(ax, box_pass['tc'], (box_user['left'] + 4, box_user['bottom']))
    draw_inheritance(ax, box_cond['tc'], (box_user['right'] - 4, box_user['bottom']))
    
    # Reservation
    res_attrs = [
        "+_id: ObjectId",
        "+trajetId: ObjectId",
        "+passagerId: ObjectId",
        "+placesReservees: int = 1",
        "+prixTotal: float",
        "+statut: string = 'en_attente'",
        "+pointPriseEnCharge: string",
        "+dateReservation: Date"
    ]
    res_meths = [
        "+confirmer(): void",
        "+rejeter(): void",
        "+annuler(): void"
    ]
    box_res = draw_class_box(ax, 34, 48, 28, "Reservation", res_attrs, res_meths, header_color="#fef3c7")
    
    # Trajet
    traj_attrs = [
        "+_id: ObjectId",
        "+conducteurId: ObjectId",
        "+placesDisponibles: int",
        "+prixParPlace: float",
        "+statut: string"
    ]
    traj_meths = [
        "+reduirePlaces(n): boolean",
        "+libererPlaces(n): void"
    ]
    box_traj = draw_class_box(ax, 66, 26, 28, "Trajet", traj_attrs, traj_meths, header_color="#ecfdf5")
    
    # Associations
    # Passager 1 -- 0..* Reservation
    draw_assoc(ax, (box_pass['right'], box_pass['bottom'] + 4), (box_res['left'], box_res['cy']), mult1="1", mult2="0..*", label="effectue >")
    # Trajet 1 -- 0..* Reservation
    draw_assoc(ax, (box_traj['left'], box_traj['cy']), (box_res['right'], box_res['bottom'] + 6), mult1="1", mult2="0..*", label="< concerne")
    # Conducteur 1 -- 0..* Trajet
    draw_assoc(ax, (box_cond['cx'], box_cond['bottom']), (box_traj['cx'], box_traj['top']), mult1="1", mult2="0..*", label="propose v")
    
    save_fig(fig, "sprint3_classes")

print("Sprint 2 & 3 diagrams code ready")

# =============================================================
# SPRINT 4 : SÉCURITÉ, TRAÇABILITÉ & MODE SOS URGENCE
# =============================================================
def generate_sprint4_usecase():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 4 : Diagramme des Cas d'Utilisation (Sécurité & Mode SOS)")
    draw_system_boundary(ax, 22, 6, 74, 86, "UniRide — Module Sécurité & Urgence Campus")
    
    # Actor
    draw_actor(ax, 11, 50, "Étudiant\n(Passager / Conducteur)", scale=1.1)
    
    # Auth Use Case (Top Center)
    draw_usecase(ax, 60, 84, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Principal Use Case 1 : Suivre le trajet en direct
    draw_usecase(ax, 43, 62, 21, 8.5, "suivre le trajet\nen direct", is_main=True)
    draw_link(ax, 15, 52, 32.5, 62)
    draw_include(ax, 47, 66.2, 57, 80.5, "«include»")
    
    # Extensions Suivi
    draw_usecase(ax, 81, 74, 21, 6.5, "valider départ du\nvéhicule")
    draw_extend(ax, 70.5, 72.5, 53.5, 64.5, "«extend»")
    
    draw_usecase(ax, 81, 64, 21, 6.5, "vérifier identité du\ncovoitureur")
    draw_extend(ax, 70.5, 63.5, 53.5, 62.5, "«extend»")
    
    draw_usecase(ax, 81, 54, 21, 6.5, "confirmer fin de\ncourse")
    draw_extend(ax, 70.5, 55, 53.5, 60.5, "«extend»")
    
    # Principal Use Case 2 : Déclencher alerte SOS
    draw_usecase(ax, 43, 26, 21, 8.5, "déclencher alerte\nSOS urgence", is_main=True)
    draw_link(ax, 15, 48, 32.5, 26)
    draw_include(ax, 46, 30.5, 58, 80.2, "«include»")
    
    # Include : Transmettre GPS
    draw_usecase(ax, 81, 36, 21, 6.5, "transmettre position\nGPS en direct", is_auth=False)
    draw_include(ax, 53.5, 28, 70.5, 34, "«include»")
    
    # Extensions SOS
    draw_usecase(ax, 81, 24, 21, 6.5, "appeler les secours\n(Police 197 / Protection)")
    draw_extend(ax, 70.5, 24.5, 53.5, 26, "«extend»")
    
    draw_usecase(ax, 81, 14, 21, 6.5, "alerter la sécurité\ndu campus ISET")
    draw_extend(ax, 70.5, 16.5, 53.5, 24, "«extend»")
    
    save_fig(fig, "sprint4_usecase")

def generate_sprint4_classes():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 4 : Diagramme de Classes (Sécurité, Traçabilité & Mode SOS)")
    
    # User
    user_attrs = ["+_id: ObjectId", "+nom: string", "+prenom: string", "+telephone: string"]
    user_meths = ["+declencherSOS(coords): AlerteSOS", "+validerArrivee(): void"]
    box_user = draw_class_box(ax, 6, 92, 28, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Trajet
    traj_attrs = ["+_id: ObjectId", "+conducteurId: ObjectId", "+statut: string = 'en_cours'"]
    traj_meths = ["+demarrerCourse(): void", "+cloturerCourse(): void"]
    box_traj = draw_class_box(ax, 66, 92, 28, "Trajet", traj_attrs, traj_meths, header_color="#ecfdf5")
    
    # CourseEnDirect
    course_attrs = [
        "+_id: ObjectId",
        "+trajetId: ObjectId",
        "+latitudeActuelle: float",
        "+longitudeActuelle: float",
        "+heureDebutReelle: Date",
        "+heureFinReelle: Date",
        "+statutGPS: string"
    ]
    course_meths = [
        "+mettreAJourPosition(lat, lng): void",
        "+calculerRetard(): int"
    ]
    box_course = draw_class_box(ax, 66, 48, 28, "CourseEnDirect", course_attrs, course_meths, header_color="#f1f5f9")
    
    # AlerteSOS
    sos_attrs = [
        "+_id: ObjectId",
        "+declencheurId: ObjectId",
        "+trajetId: ObjectId",
        "+latitude: float",
        "+longitude: float",
        "+dateDeclenchement: Date",
        "+statut: string = 'active'",
        "+resoluePar: ObjectId"
    ]
    sos_meths = [
        "+genererAlerte(userId, coords): void",
        "+marquerResolue(adminId): void"
    ]
    box_sos = draw_class_box(ax, 6, 52, 28, "AlerteSOS", sos_attrs, sos_meths, header_color="#fee2e2")
    
    # NotificationUrgence
    notif_attrs = [
        "+_id: ObjectId",
        "+alerteId: ObjectId",
        "+destinataire: string",
        "+canal: string = 'SMS/Push'",
        "+envoyee: boolean"
    ]
    notif_meths = [
        "+diffuserAlerte(): boolean"
    ]
    box_notif = draw_class_box(ax, 6, 12, 28, "NotificationUrgence", notif_attrs, notif_meths, header_color="#ffedd5")
    
    # Associations
    # User 1 -- 0..* AlerteSOS
    draw_assoc(ax, (box_user['cx'], box_user['bottom']), (box_sos['cx'], box_sos['top']), mult1="1", mult2="0..*", label="déclenche v")
    # Trajet 1 -- 0..1 CourseEnDirect
    draw_assoc(ax, (box_traj['cx'], box_traj['bottom']), (box_course['cx'], box_course['top']), mult1="1", mult2="0..1", label="fait l'objet de v")
    # AlerteSOS 1 *-- 1..* NotificationUrgence
    draw_composition(ax, (box_sos['cx'], box_sos['bottom']), (box_notif['cx'], box_notif['top']), mult_owner="1", mult_owned="1..*", label="génère v")
    # AlerteSOS 0..* -- 1 Trajet
    draw_assoc(ax, (box_sos['right'], box_sos['cy']), (box_traj['left'], box_traj['bottom'] + 4), mult1="0..*", mult2="1", label="concerne >")
    
    save_fig(fig, "sprint4_classes")

# =============================================================
# SPRINT 5 : AVIS, GAMIFICATION & ÉCO-RESPONSABILITÉ
# =============================================================
def generate_sprint5_usecase():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 5 : Diagramme des Cas d'Utilisation (Avis & Gamification)")
    draw_system_boundary(ax, 22, 6, 74, 86, "UniRide — Module Avis & Éco-responsabilité")
    
    # Actor
    draw_actor(ax, 11, 50, "Étudiant\n(Membre UniRide)", scale=1.1)
    
    # Auth Use Case (Top Center)
    draw_usecase(ax, 60, 84, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Principal Use Case 1 : Évaluer un covoiturage
    draw_usecase(ax, 43, 62, 21, 8.5, "évaluer un\ncovoiturage", is_main=True)
    draw_link(ax, 15, 52, 32.5, 62)
    draw_include(ax, 47, 66.2, 57, 80.5, "«include»")
    
    # Extensions Évaluer
    draw_usecase(ax, 81, 74, 21, 6.5, "attribuer une note\n(1 à 5 étoiles)")
    draw_extend(ax, 70.5, 72.5, 53.5, 64.5, "«extend»")
    
    draw_usecase(ax, 81, 64, 21, 6.5, "rédiger un avis ou\ncommentaire")
    draw_extend(ax, 70.5, 63.5, 53.5, 62.5, "«extend»")
    
    draw_usecase(ax, 81, 54, 21, 6.5, "signaler un comportement\ninapproprié")
    draw_extend(ax, 70.5, 55, 53.5, 60.5, "«extend»")
    
    # Principal Use Case 2 : Consulter impact écologique et récompenses
    draw_usecase(ax, 43, 26, 21, 8.5, "consulter son impact\net récompenses", is_main=True)
    draw_link(ax, 15, 48, 32.5, 26)
    draw_include(ax, 46, 30.5, 58, 80.2, "«include»")
    
    # Extensions Gamification
    draw_usecase(ax, 81, 36, 21, 6.5, "visualiser CO2 & DT\néconomisés")
    draw_extend(ax, 70.5, 34.5, 53.5, 28, "«extend»")
    
    draw_usecase(ax, 81, 26, 21, 6.5, "débloquer des badges\néco-responsables")
    draw_extend(ax, 70.5, 26, 53.5, 26, "«extend»")
    
    draw_usecase(ax, 81, 16, 21, 6.5, "consulter le classement\ndu campus ISET")
    draw_extend(ax, 70.5, 17.5, 53.5, 24, "«extend»")
    
    save_fig(fig, "sprint5_usecase")

def generate_sprint5_classes():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 5 : Diagramme de Classes (Avis, Impact & Gamification)")
    
    # User
    user_attrs = ["+_id: ObjectId", "+nom: string", "+prenom: string", "+email: string"]
    user_meths = ["+evaluerUtilisateur(avis): Avis", "+signaler(signalement): void"]
    box_user = draw_class_box(ax, 4, 92, 28, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Avis
    avis_attrs = [
        "+_id: ObjectId",
        "+auteurId: ObjectId",
        "+cibleId: ObjectId",
        "+trajetId: ObjectId",
        "+note: int",
        "+commentaire: string",
        "+dateCreation: Date"
    ]
    avis_meths = [
        "+publier(): boolean",
        "+modifier(note, comm): void"
    ]
    box_avis = draw_class_box(ax, 42, 92, 26, "Avis", avis_attrs, avis_meths, header_color="#fef3c7")
    
    # StatistiquesEco
    eco_attrs = [
        "+_id: ObjectId",
        "+userId: ObjectId",
        "+co2EconomiseKg: float",
        "+argentEconomiseDT: float",
        "+totalKmPartages: float",
        "+totalTrajetsRealises: int"
    ]
    eco_meths = [
        "+ajouterTrajet(km, nbPass): void",
        "+getBilanCarbone(): Object"
    ]
    box_eco = draw_class_box(ax, 4, 48, 28, "StatistiquesEco", eco_attrs, eco_meths, header_color="#ecfdf5")
    
    # Badge
    badge_attrs = [
        "+code: string",
        "+titre: string",
        "+description: string",
        "+icone: string",
        "+seuilKm: int"
    ]
    badge_meths = [
        "+verifierEligibilite(stats): boolean",
        "+debloquer(userId): void"
    ]
    box_badge = draw_class_box(ax, 42, 48, 26, "Badge", badge_attrs, badge_meths, header_color="#e0f2fe")
    
    # Signalement
    sig_attrs = [
        "+_id: ObjectId",
        "+auteurId: ObjectId",
        "+cibleId: ObjectId",
        "+trajetId: ObjectId",
        "+motif: string",
        "+details: string",
        "+statut: string = 'en_attente'"
    ]
    sig_meths = [
        "+soumettre(): boolean",
        "+traiter(decision): void"
    ]
    box_sig = draw_class_box(ax, 74, 92, 24, "Signalement", sig_attrs, sig_meths, header_color="#fee2e2")
    
    # Associations
    # User 1 -- 0..* Avis
    draw_assoc(ax, (box_user['right'], box_user['top'] - 6), (box_avis['left'], box_avis['top'] - 6), mult1="1", mult2="0..*", label="rédige >")
    # User 1 *-- 1 StatistiquesEco
    draw_composition(ax, (box_user['cx'], box_user['bottom']), (box_eco['cx'], box_eco['top']), mult_owner="1", mult_owned="1", label="cumule v")
    # StatistiquesEco 0..* -- 0..* Badge
    draw_assoc(ax, (box_eco['right'], box_eco['cy']), (box_badge['left'], box_badge['cy']), mult1="1", mult2="0..*", label="débloque >")
    # User 1 -- 0..* Signalement
    draw_assoc(ax, (box_avis['right'], box_avis['cy']), (box_sig['left'], box_sig['cy']), mult1="1", mult2="0..*", label="signale >")
    
    save_fig(fig, "sprint5_classes")

# =============================================================
# SPRINT 6 : ADMINISTRATION & MODÉRATION CAMPUS
# =============================================================
def generate_sprint6_usecase():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 6 : Diagramme des Cas d'Utilisation (Administration & Modération)")
    draw_system_boundary(ax, 22, 6, 74, 86, "UniRide — Module Administration & Modération Campus")
    
    # Actor
    draw_actor(ax, 11, 50, "Administrateur\n(Campus ISET)", scale=1.1)
    
    # Auth Use Case (Top Center)
    draw_usecase(ax, 60, 84, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Principal Use Case 1 : Superviser la plateforme
    draw_usecase(ax, 43, 62, 21, 8.5, "superviser la\nplateforme", is_main=True)
    draw_link(ax, 15, 52, 32.5, 62)
    draw_include(ax, 47, 66.2, 57, 80.5, "«include»")
    
    # Extensions Supervision
    draw_usecase(ax, 81, 74, 21, 6.5, "consulter statistiques\net indicateurs clés")
    draw_extend(ax, 70.5, 72.5, 53.5, 64.5, "«extend»")
    
    draw_usecase(ax, 81, 64, 21, 6.5, "superviser alertes SOS\nen direct")
    draw_extend(ax, 70.5, 63.5, 53.5, 62.5, "«extend»")
    
    draw_usecase(ax, 81, 54, 21, 6.5, "clôturer incident SOS\nrésolu")
    draw_extend(ax, 70.5, 55, 53.5, 60.5, "«extend»")
    
    # Principal Use Case 2 : Gérer utilisateurs et signalements
    draw_usecase(ax, 43, 26, 21, 8.5, "gérer les utilisateurs\net signalements", is_main=True)
    draw_link(ax, 15, 48, 32.5, 26)
    draw_include(ax, 46, 30.5, 58, 80.2, "«include»")
    
    # Extensions Gestion & Modération
    draw_usecase(ax, 81, 36, 21, 6.5, "consulter comptes et\nrôles étudiants")
    draw_extend(ax, 70.5, 34.5, 53.5, 28, "«extend»")
    
    draw_usecase(ax, 81, 26, 21, 6.5, "traiter / classer\nun signalement")
    draw_extend(ax, 70.5, 26, 53.5, 26, "«extend»")
    
    draw_usecase(ax, 81, 16, 21, 6.5, "bloquer ou débloquer\nun utilisateur")
    draw_extend(ax, 70.5, 17.5, 53.5, 24, "«extend»")
    
    save_fig(fig, "sprint6_usecase")

def generate_sprint6_classes():
    fig, ax = create_base_fig(w=16, h=10, title="UniRide — Sprint 6 : Diagramme de Classes (Administration & Modération)")
    
    # User (Parent)
    user_attrs = ["+_id: ObjectId", "+nom: string", "+prenom: string", "+email: string", "+role: string", "+isBlocked: boolean"]
    user_meths = ["+sAuthentifier(): string"]
    box_user = draw_class_box(ax, 36, 94, 28, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Administrateur (Child)
    admin_attrs = ["+niveauAcces: string = 'superadmin'", "+derniereConnexionAdmin: Date"]
    admin_meths = [
        "+consulterDashboard(): DashboardStats",
        "+bloquerUtilisateur(id, motif): boolean",
        "+debloquerUtilisateur(id): boolean",
        "+traiterSignalement(id, action): void",
        "+resoudreAlerteSOS(id): void"
    ]
    box_admin = draw_class_box(ax, 36, 56, 28, "Administrateur", admin_attrs, admin_meths, header_color="#fae8ff")
    
    # Inheritance
    draw_inheritance(ax, box_admin['tc'], box_user['bc'])
    
    # DashboardStats
    stats_attrs = [
        "+nbEtudiantsInscrits: int",
        "+nbConducteursActifs: int",
        "+nbTrajetsTotal: int",
        "+nbSOSActifs: int",
        "+nbSignalementsEnAttente: int",
        "+totalCO2EviteKg: float"
    ]
    stats_meths = [
        "+calculerIndicateurs(): Object",
        "+exporterRapport(): Object"
    ]
    box_stats = draw_class_box(ax, 4, 56, 26, "DashboardStats", stats_attrs, stats_meths, header_color="#ecfdf5")
    
    # HistoriqueActionAdmin
    hist_attrs = [
        "+_id: ObjectId",
        "+adminId: ObjectId",
        "+action: string",
        "+cibleId: ObjectId",
        "+motif: string",
        "+dateAction: Date"
    ]
    hist_meths = [
        "+journaliser(): void"
    ]
    box_hist = draw_class_box(ax, 70, 56, 26, "HistoriqueActionAdmin", hist_attrs, hist_meths, header_color="#f1f5f9")
    
    # Associations
    # Admin consulte DashboardStats
    draw_assoc(ax, (box_admin['left'], box_admin['cy']), (box_stats['right'], box_stats['cy']), mult1="1", mult2="1", label="consulte >")
    # Admin effectue HistoriqueActionAdmin
    draw_assoc(ax, (box_admin['right'], box_admin['cy']), (box_hist['left'], box_hist['cy']), mult1="1", mult2="0..*", label="enregistre >")
    
    save_fig(fig, "sprint6_classes")

# =============================================================
# GLOBAL USE CASE DIAGRAM
# =============================================================
def generate_global_usecase():
    fig, ax = create_base_fig(w=18, h=12, title="UniRide — Diagramme Global des Cas d'Utilisation (Vue Système Complète)")
    draw_system_boundary(ax, 20, 4, 76, 90, "Système UniRide — Covoiturage Étudiant ISET Nabeul")
    
    # Actors on Left
    draw_actor(ax, 9, 82, "Étudiant\n(Général)", scale=1.0)
    draw_actor(ax, 9, 56, "Conducteur\n(Véhiculé)", scale=1.0)
    draw_actor(ax, 9, 32, "Passager\n(Recherche)", scale=1.0)
    
    # Actor on Right
    draw_actor(ax, 98, 48, "Administrateur\n(Campus ISET)", scale=1.0)
    
    # Central Authentication Use Case
    draw_usecase(ax, 54, 88, 18, 7.5, "s'authentifier", is_auth=True)
    
    # Macro Use Cases
    # 1. Gérer profil & préférences (Étudiant)
    draw_usecase(ax, 34, 78, 19, 7.5, "gérer son profil\n& préférences", is_main=True)
    draw_link(ax, 12, 82, 24.5, 78)
    draw_include(ax, 38, 81.5, 48, 86.5, "«include»")
    
    # 2. S'inscrire (Public)
    draw_usecase(ax, 34, 91, 16, 6.5, "s'inscrire", is_main=False)
    draw_link(ax, 12, 85, 26, 91)
    
    # 3. Gérer trajets & véhicule (Conducteur)
    draw_usecase(ax, 34, 58, 19, 7.5, "publier & gérer\nses trajets", is_main=True)
    draw_link(ax, 12, 56, 24.5, 58)
    draw_include(ax, 36, 61.5, 51, 85, "«include»")
    
    # 4. Gérer véhicule (Conducteur)
    draw_usecase(ax, 34, 47, 19, 7.0, "enregistrer\nson véhicule", is_main=True)
    draw_link(ax, 12, 54, 24.5, 47)
    draw_include(ax, 36, 50.5, 52, 84.5, "«include»")
    
    # 5. Rechercher trajets & réserver (Passager)
    draw_usecase(ax, 34, 34, 19, 7.5, "rechercher trajets\nselon EDT", is_main=True)
    draw_link(ax, 12, 33, 24.5, 34)
    draw_include(ax, 37, 37.5, 52.5, 84.5, "«include»")
    
    # 6. Gérer réservations (Passager)
    draw_usecase(ax, 34, 22, 19, 7.5, "gérer ses\nréservations", is_main=True)
    draw_link(ax, 12, 31, 24.5, 22)
    draw_include(ax, 37, 25.5, 53, 84.5, "«include»")
    
    # 7. Suivi en direct & SOS (Tous Étudiants)
    draw_usecase(ax, 68, 68, 19, 7.5, "suivre trajet &\ndéclancher SOS", is_main=True)
    draw_link(ax, 12, 78, 58.5, 69)
    draw_include(ax, 64, 71.5, 58, 84.5, "«include»")
    
    # 8. Avis & Badges (Tous Étudiants)
    draw_usecase(ax, 68, 54, 19, 7.5, "noter covoitureur\n& cumuler badges", is_main=True)
    draw_link(ax, 12, 75, 58.5, 55)
    draw_include(ax, 64, 57.5, 56, 84.5, "«include»")
    
    # 9. Modération & Signalements (Admin)
    draw_usecase(ax, 68, 38, 20, 7.5, "traiter signalements\n& bloquer comptes", is_main=True)
    draw_link(ax, 95, 48, 78, 38)
    draw_include(ax, 66, 41.5, 55, 84.5, "«include»")
    
    # 10. Dashboard & Résolution SOS (Admin)
    draw_usecase(ax, 68, 22, 20, 7.5, "consulter dashboard\n& clôturer SOS", is_main=True)
    draw_link(ax, 95, 46, 78, 22)
    draw_include(ax, 66, 25.5, 54, 84.5, "«include»")
    
    save_fig(fig, "global_usecase")

# =============================================================
# GLOBAL CLASS DIAGRAM
# =============================================================
def generate_global_classes():
    fig, ax = create_base_fig(w=20, h=14, title="UniRide — Diagramme Global des Classes du Système")
    
    # User (Core)
    user_attrs = ["+_id: ObjectId", "+nom: string", "+prenom: string", "+email: string", "+telephone: string", "+role: string", "+isBlocked: boolean"]
    user_meths = ["+sAuthentifier(): string", "+sInscrire(): boolean", "+modifierProfil(): void"]
    box_user = draw_class_box(ax, 38, 96, 26, "User", user_attrs, user_meths, header_color="#e0e7ff")
    
    # Children of User
    cond_attrs = ["+permisValide: boolean"]
    cond_meths = ["+creerTrajet(): Trajet"]
    box_cond = draw_class_box(ax, 10, 68, 22, "Conducteur", cond_attrs, cond_meths, header_color="#eff6ff")
    
    pass_attrs = ["+totalReservations: int"]
    pass_meths = ["+reserver(): Reservation"]
    box_pass = draw_class_box(ax, 40, 68, 22, "Passager", pass_attrs, pass_meths, header_color="#eff6ff")
    
    admin_attrs = ["+derniereConnexion: Date"]
    admin_meths = ["+traiterSignalement(): void"]
    box_admin = draw_class_box(ax, 70, 68, 22, "Administrateur", admin_attrs, admin_meths, header_color="#fae8ff")
    
    # Inheritances to User
    draw_inheritance(ax, box_cond['tc'], (box_user['left'] + 4, box_user['bottom']))
    draw_inheritance(ax, box_pass['tc'], (box_user['cx'], box_user['bottom']))
    draw_inheritance(ax, box_admin['tc'], (box_user['right'] - 4, box_user['bottom']))
    
    # Vehicule
    veh_attrs = ["+marque: string", "+modele: string", "+immatriculation: string"]
    veh_meths = ["+getDetails(): string"]
    box_veh = draw_class_box(ax, 10, 48, 22, "Vehicule", veh_attrs, veh_meths, header_color="#fef3c7")
    draw_composition(ax, (box_cond['cx'], box_cond['bottom']), (box_veh['cx'], box_veh['top']), mult_owner="1", mult_owned="0..1", label="conduit v")
    
    # Trajet
    traj_attrs = ["+_id: ObjectId", "+conducteurId: ObjectId", "+depart: string", "+destination: string", "+dateDepart: Date", "+placesDisponibles: int", "+prix: float", "+statut: string"]
    traj_meths = ["+publier(): boolean", "+annuler(): void", "+reduirePlaces(n): boolean"]
    box_traj = draw_class_box(ax, 10, 26, 24, "Trajet", traj_attrs, traj_meths, header_color="#ecfdf5")
    draw_assoc(ax, (box_veh['cx'], box_veh['bottom']), (box_traj['cx'], box_traj['top']), mult1="1", mult2="0..*", label="effectué avec v")
    
    # Reservation
    res_attrs = ["+_id: ObjectId", "+trajetId: ObjectId", "+passagerId: ObjectId", "+placesReservees: int", "+statut: string"]
    res_meths = ["+confirmer(): void", "+annuler(): void"]
    box_res = draw_class_box(ax, 40, 42, 22, "Reservation", res_attrs, res_meths, header_color="#fef3c7")
    draw_assoc(ax, (box_pass['cx'], box_pass['bottom']), (box_res['cx'], box_res['top']), mult1="1", mult2="0..*", label="effectue v")
    draw_assoc(ax, (box_traj['right'], box_traj['cy']), (box_res['left'], box_res['bottom'] + 4), mult1="1", mult2="0..*", label="concerne >")
    
    # AlerteSOS
    sos_attrs = ["+_id: ObjectId", "+declencheurId: ObjectId", "+latitude: float", "+longitude: float", "+statut: string"]
    sos_meths = ["+declencher(): void", "+resoudre(): void"]
    box_sos = draw_class_box(ax, 40, 16, 22, "AlerteSOS", sos_attrs, sos_meths, header_color="#fee2e2")
    draw_assoc(ax, (box_res['cx'], box_res['bottom']), (box_sos['cx'], box_sos['top']), mult1="1", mult2="0..*", label="déclenche v")
    
    # Avis
    avis_attrs = ["+_id: ObjectId", "+auteurId: ObjectId", "+cibleId: ObjectId", "+note: int", "+commentaire: string"]
    avis_meths = ["+publier(): boolean"]
    box_avis = draw_class_box(ax, 70, 42, 22, "Avis", avis_attrs, avis_meths, header_color="#e0f2fe")
    draw_assoc(ax, (box_res['right'], box_res['cy']), (box_avis['left'], box_avis['cy']), mult1="1", mult2="0..1", label="évalue >")
    
    # Signalement
    sig_attrs = ["+_id: ObjectId", "+auteurId: ObjectId", "+cibleId: ObjectId", "+motif: string", "+statut: string"]
    sig_meths = ["+traiter(action): void"]
    box_sig = draw_class_box(ax, 70, 16, 22, "Signalement", sig_attrs, sig_meths, header_color="#fed7aa")
    draw_assoc(ax, (box_admin['cx'], box_admin['bottom']), (box_sig['cx'], box_sig['top']), mult1="1", mult2="0..*", label="modère v")
    
    save_fig(fig, "global_classes")

# =============================================================
# MAIN RUNNER
# =============================================================
if __name__ == "__main__":
    print("Generating all 14 UML Diagrams for UniRide...")
    generate_sprint1_usecase()
    generate_sprint1_classes()
    generate_sprint2_usecase()
    generate_sprint2_classes()
    generate_sprint3_usecase()
    generate_sprint3_classes()
    generate_sprint4_usecase()
    generate_sprint4_classes()
    generate_sprint5_usecase()
    generate_sprint5_classes()
    generate_sprint6_usecase()
    generate_sprint6_classes()
    generate_global_usecase()
    generate_global_classes()
    print("ALL 14 DIAGRAMS GENERATED SUCCESSFULLY!")
