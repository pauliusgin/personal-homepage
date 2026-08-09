import { PortfolioProjectRow } from "@/components/portfolio/PortfolioProjectRow";
import { portfolioProjects } from "@/portfolio/portfolioProjects";

/**
 * A `<ul>` rather than the feed's `<ol>`: the catalogue has an order, but it is
 * an editorial one, not a ranking a reader should infer.
 */
export function PortfolioProjectList() {
  return (
    <section className="portfolio-column">
      <ul className="portfolio-list">
        {portfolioProjects.map((project) => (
          <PortfolioProjectRow key={project.projectId} project={project} />
        ))}
      </ul>
    </section>
  );
}
