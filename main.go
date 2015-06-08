package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/tealeg/xlsx"
	"net/http"
)

type Competition struct {
	Name string `json:"name"`

	Scores []Score `json:"scores"`
}

type Score struct {
	Player string `json:"player"`
	Rounds []int  `json:"rounds"`
}

func ParseXlsx(file string) []Competition {
	xlFile, err := xlsx.OpenFile(file)

	if err != nil {
		fmt.Println(err)
	}

	var comps []Competition

	for _, sheet := range xlFile.Sheets {
		var comp Competition
		comp.Name = sheet.Name

		for i, row := range sheet.Rows {
			if i == 0 {
				continue
			}

			var score Score

			for j, cell := range row.Cells {
				if j == 0 {
					score.Player = cell.String()
				} else {
					r, _ := cell.Int()
					if j < 3 && len(cell.String()) > 0 {
						score.Rounds = append(score.Rounds, r)
					}
				}
			}

			comp.Scores = append(comp.Scores, score)
		}

		comps = append(comps, comp)
	}

	return comps
}

func main() {
	excelFileName := "./scores.xlsx"

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.LoadHTMLGlob("./static/templates/*")

	r.Static("/static", "./static")

	r.GET("/", func(c *gin.Context) {
		obj := gin.H{}
		c.HTML(http.StatusOK, "index.tmpl", obj)
	})

	r.GET("/scores", func(c *gin.Context) {
		comps := ParseXlsx(excelFileName)
		c.JSON(200, comps)
	})

	// Listen and server on 0.0.0.0:8080
	fmt.Println("Listening on localhost:8080")
	r.Run(":8080")
}
