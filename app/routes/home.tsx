import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import Upload from "../../components/Upload";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router";
import { MAX_UPLOAD_FILE_SIZE_BYTES } from "../../libs/constants";
import { persistUploadImage } from "../../libs/uploadStorage";

const formatFileSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${bytes} bytes`;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
    const navigate = useNavigate();

    const handleUploadComplete = async (base64Image: string, mimeType: string) => {
        const newId = Date.now().toString();

        try {
            await persistUploadImage(newId, { base64Image, mimeType });
            navigate(`/visualizer/${newId}`);
        } catch {
            // Preserve the previous successful-navigation behavior by only navigating after persistence succeeds.
        }
    }

  return (
    <div className="home">
      <Navbar />
      
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Introducing Conspot 2.0</p>
        </div>

        <h1>Build beautiful spaces at the speed of thought with Conspot</h1>

        <p className="subtitle">
          Conspot is an AI-first design environment that helps you visualize, render, and ship architectural projects faster than ever.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>

          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h3>Upload your floor plan</h3>
              <p>Supports JPG and PNG formats up to {formatFileSize(MAX_UPLOAD_FILE_SIZE_BYTES)}</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>

              <p>Your latest work and shared community projects, all in one place.</p>
            </div>
          </div>

          <div className="projects-grid">
            <div className="project-card group">
              <div className="preview">
                <img src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png" alt="Project" />

                <div className="badge">
                  <span>Community</span>
                </div>
              </div>

              <div className="card-body">
                <div>
                  <h3>Project Manhattan</h3>

                  <div className="meta">
                    <Clock size={12} />
                    <span>{new Date('01.01.2027').toLocaleDateString()}</span>
                    <span>By Abdul Ahad</span>
                  </div>
                </div>

                <div className="arrow">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
