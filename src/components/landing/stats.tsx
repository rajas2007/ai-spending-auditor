import { motion } from "framer-motion";

const stats = [
  { value: "$2.4M+", label: "Optimized to date" },
  { value: "32%", label: "Average savings" },
  { value: "1,200+", label: "Stacks audited" },
  { value: "60s", label: "Avg time to insight" },
];

export function Stats() {
  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass grid grid-cols-2 gap-6 rounded-2xl p-8 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="text-center"
            >
              <div className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
